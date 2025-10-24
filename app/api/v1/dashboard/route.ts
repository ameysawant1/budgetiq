import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { verifyToken } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Invalid token' } }, { status: 401 });

    const userId = payload.sub;

    const db = await getDb();
    const transactionsCollection = db.collection('transactions');
    const currencyAccountsCollection = db.collection('currency_accounts');

    // Get last 30 days date range for spending overview
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get current month date range for monthly stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get all transactions
    const allTransactions = await transactionsCollection.find({ userId }).toArray();

    // Get monthly transactions for summary stats
    const monthlyTransactions = await transactionsCollection.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).toArray();

    // Get last 30 days transactions for spending overview
    const recentTransactions = await transactionsCollection.find({
      userId,
      date: { $gte: thirtyDaysAgo, $lte: now }
    }).toArray();

    // Get currency accounts for balance calculation
    const currencyAccounts = await currencyAccountsCollection.find({ userId }).toArray();

    // Get exchange rates for currency conversion
    const ratesCollection = db.collection('currency_rates');
    const latestRates = await ratesCollection.findOne({}, { sort: { lastUpdated: -1 } });

    // Calculate total balance (sum of all currency account balances converted to INR)
    let totalBalance = 0;
    for (const account of currencyAccounts) {
      let balanceInINR = account.balance || 0;

      // Convert to INR if not already in INR
      if (account.currency !== 'INR' && latestRates?.rates) {
        const rate = latestRates.rates[account.currency];
        if (rate) {
          balanceInINR = account.balance * rate;
        }
      }

      totalBalance += balanceInINR;
    }

    // Calculate monthly income and expenses
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    for (const transaction of monthlyTransactions) {
      if (transaction.amount > 0) {
        monthlyIncome += transaction.amount;
      } else {
        monthlyExpenses += Math.abs(transaction.amount);
      }
    }

    // Get category distribution for pie chart
    const categoryStats: Record<string, number> = {};
    for (const transaction of monthlyTransactions) {
      if (transaction.amount < 0) { // Only expenses for category distribution
        const category = transaction.category || 'Uncategorized';
        if (!categoryStats[category]) {
          categoryStats[category] = 0;
        }
        categoryStats[category] += Math.abs(transaction.amount);
      }
    }

    // Get spending overview data (daily spending for the last 30 days)
    const spendingOverview: Record<string, number> = {};
    for (const transaction of recentTransactions) {
      if (transaction.amount < 0) {
        const date = transaction.date.toISOString().split('T')[0];
        if (!spendingOverview[date]) {
          spendingOverview[date] = 0;
        }
        spendingOverview[date] += Math.abs(transaction.amount);
      }
    }

    // Convert to arrays for frontend
    const categoryData = Object.entries(categoryStats).map(([category, amount]) => ({
      category,
      amount
    }));

    const spendingData = Object.entries(spendingOverview)
      .map(([date, amount]) => ({
        date,
        amount
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      data: {
        lastUpdated: new Date().toISOString(),
        summary: {
          totalBalance,
          monthlyIncome,
          monthlyExpenses,
          transactionCount: allTransactions.length,
          monthlyTransactionCount: monthlyTransactions.length
        },
        charts: {
          categoryDistribution: categoryData,
          spendingOverview: spendingData
        }
      }
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ success: false, error: { code: 'internal_error', message: 'Internal server error' } }, { status: 500 });
  }
}
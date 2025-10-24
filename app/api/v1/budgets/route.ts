import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../lib/mongodb';
import { verifyToken } from '../../../../lib/auth';

interface BudgetDocument {
  _id: ObjectId;
  userId: string;
  category: string;
  period: string;
  limit: number;
  spentToDate?: number;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Invalid token' } }, { status: 401 });

    const userId = payload.sub;

    const db = await getDb();
    const collection = db.collection('budgets');

    const budgets = await collection.find({ userId }).toArray() as BudgetDocument[];

    // Calculate spentToDate by summing absolute value of expenses in category for current month
    const transactionsCollection = db.collection('transactions');
    for (const budget of budgets) {
      const spent = await transactionsCollection.aggregate([
        { $match: { userId, category: budget.category, amount: { $lt: 0 }, date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
        { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }
      ]).toArray();
      budget.spentToDate = spent[0]?.total || 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        budgets: budgets.map((b) => ({
          id: b._id.toString(),
          category: b.category,
          period: b.period,
          limit: b.limit,
          spentToDate: b.spentToDate
        }))
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { code: 'internal_error', message: 'Internal server error' } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Invalid token' } }, { status: 401 });

    const userId = payload.sub;

    const body = await request.json();
    const { category, period, limit } = body;

    if (!category || !period || !limit || limit <= 0) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'Invalid input' } }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('budgets');

    const budget = {
      userId,
      category,
      period,
      limit: parseFloat(limit),
      spentToDate: 0
    };

    const result = await collection.insertOne(budget);

    return NextResponse.json({
      success: true,
      data: {
        budget: {
          id: result.insertedId.toString(),
          ...budget
        }
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { code: 'internal_error', message: 'Internal server error' } }, { status: 500 });
  }
}
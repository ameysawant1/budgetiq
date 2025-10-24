import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../../lib/mongodb';
import { verifyToken } from '../../../../../lib/auth';

interface CurrencyAccount {
  _id: ObjectId;
  userId: string;
  currency: string;
  balance: number;
  accountName: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Invalid token' } }, { status: 401 });

    const userId = payload.sub;

    const db = await getDb();
    const collection = db.collection('currency_accounts');

    const accounts = await collection.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).toArray() as CurrencyAccount[];

    // If no accounts exist, create a default INR account
    if (accounts.length === 0) {
      const defaultAccount = {
        userId,
        currency: 'INR',
        balance: 0,
        accountName: 'Primary Account',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(defaultAccount);
      accounts.push({ ...defaultAccount, _id: result.insertedId });
    }

    return NextResponse.json({
      success: true,
      data: {
        accounts: accounts.map(account => ({
          id: account._id.toString(),
          currency: account.currency,
          balance: account.balance,
          accountName: account.accountName,
          isDefault: account.isDefault,
          createdAt: account.createdAt.toISOString(),
          updatedAt: account.updatedAt.toISOString()
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
    const { currency, accountName, initialBalance = 0 } = body;

    if (!currency || !accountName) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'Currency and account name are required' } }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('currency_accounts');

    // Check if account with same currency already exists
    const existingAccount = await collection.findOne({ userId, currency });
    if (existingAccount) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'Account with this currency already exists' } }, { status: 400 });
    }

    const account = {
      userId,
      currency,
      balance: parseFloat(initialBalance) || 0,
      accountName,
      isDefault: false, // Only one default account (INR) for now
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(account);

    return NextResponse.json({
      success: true,
      data: {
        account: {
          id: result.insertedId.toString(),
          ...account,
          createdAt: account.createdAt.toISOString(),
          updatedAt: account.updatedAt.toISOString()
        }
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { code: 'internal_error', message: 'Internal server error' } }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../lib/mongodb';
import { verifyToken } from '../../../../lib/auth';

interface TransactionQuery {
  userId: string;
  date?: { $gte?: Date; $lte?: Date };
  category?: string;
  $or?: Array<{ merchant: { $regex: string; $options: string } } | { notes: { $regex: string; $options: string } }>;
}

interface TransactionDocument {
  _id: ObjectId;
  userId: string;
  date: Date;
  amount: number;
  currency: string;
  merchant: string;
  category: string | null;
  notes: string;
  split: unknown[];
  recurringId?: string;
  receiptId?: string;
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Invalid token' } }, { status: 401 });

    const userId = payload.sub;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '25');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const category = searchParams.get('category');
    const q = searchParams.get('q');

    const db = await getDb();
    const collection = db.collection('transactions');

    const query: TransactionQuery = { userId };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    if (category) query.category = category;
    if (q) query.$or = [
      { merchant: { $regex: q, $options: 'i' } },
      { notes: { $regex: q, $options: 'i' } }
    ];

    const transactions = await collection.find(query).sort({ date: -1 }).limit(limit).toArray() as TransactionDocument[];

    return NextResponse.json({
      success: true,
      data: {
        items: transactions.map((t) => ({
          id: t._id.toString(),
          date: t.date.toISOString().split('T')[0],
          amount: t.amount,
          currency: t.currency,
          merchant: t.merchant,
          category: t.category,
          notes: t.notes,
          split: t.split,
          recurringId: t.recurringId,
          receiptId: t.receiptId,
          createdAt: t.createdAt.toISOString()
        })),
        nextCursor: transactions.length === limit ? transactions[transactions.length - 1]._id.toString() : undefined
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
    const { date, amount, currency, merchant, category, notes, split } = body;

    if (!date || !amount || !currency || !merchant) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'Invalid input' } }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('transactions');

    const transaction = {
      userId,
      date: new Date(date),
      amount: parseFloat(amount),
      currency,
      merchant,
      category: category || null,
      notes: notes || '',
      split: split || [],
      createdAt: new Date()
    };

    const result = await collection.insertOne(transaction);

    return NextResponse.json({
      success: true,
      data: {
        transaction: {
          id: result.insertedId.toString(),
          ...transaction,
          date: transaction.date.toISOString().split('T')[0],
          createdAt: transaction.createdAt.toISOString()
        }
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { code: 'internal_error', message: 'Internal server error' } }, { status: 500 });
  }
}
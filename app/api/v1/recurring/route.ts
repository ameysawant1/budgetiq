import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../lib/mongodb';
import { verifyToken } from '../../../../lib/auth';

interface RecurringDocument {
  _id: ObjectId;
  userId: string;
  templateTransaction: Record<string, unknown>;
  frequency: string;
  nextRun: Date;
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Invalid token' } }, { status: 401 });

    const userId = payload.sub;

    const db = await getDb();
    const collection = db.collection('recurring');

    const items = await collection.find({ userId }).toArray() as RecurringDocument[];

    return NextResponse.json({
      success: true,
      data: {
        items: items.map((r) => ({
          id: r._id.toString(),
          templateTransaction: r.templateTransaction,
          frequency: r.frequency,
          nextRun: r.nextRun.toISOString(),
          createdAt: r.createdAt.toISOString()
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
    const { templateTransaction, frequency } = body;

    if (!templateTransaction || !frequency) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'Invalid input' } }, { status: 400 });
    }

    const nextRun = new Date();
    nextRun.setMonth(nextRun.getMonth() + 1); // simple monthly

    const db = await getDb();
    const collection = db.collection('recurring');

    const recurringRule = {
      userId,
      templateTransaction,
      frequency,
      nextRun,
      createdAt: new Date()
    };

    const result = await collection.insertOne(recurringRule);

    return NextResponse.json({
      success: true,
      data: {
        recurringRule: {
          id: result.insertedId.toString(),
          ...recurringRule,
          nextRun: recurringRule.nextRun.toISOString(),
          createdAt: recurringRule.createdAt.toISOString()
        }
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { code: 'internal_error', message: 'Internal server error' } }, { status: 500 });
  }
}
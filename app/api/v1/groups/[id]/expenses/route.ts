import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../../../lib/mongodb';
import { verifyToken } from '../../../../../../lib/auth';

interface ExpenseDocument {
  _id: ObjectId;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  createdAt: Date;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Invalid token' } }, { status: 401 });

    const userId = payload.sub;
    const { id } = await params;

    const db = await getDb();
    const groupsCollection = db.collection('groups');
    const expensesCollection = db.collection('group-expenses');

    // Check if user is member of the group
    const group = await groupsCollection.findOne({ _id: new ObjectId(id), members: userId });
    if (!group) {
      return NextResponse.json({ success: false, error: { code: 'not_found', message: 'Group not found' } }, { status: 404 });
    }

    const expenses = await expensesCollection.find({ groupId: id }).toArray() as ExpenseDocument[];

    return NextResponse.json({
      success: true,
      data: {
        expenses: expenses.map((e) => ({
          id: e._id.toString(),
          description: e.description,
          amount: e.amount,
          paidBy: e.paidBy,
          createdAt: e.createdAt.toISOString()
        }))
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { code: 'internal_error', message: 'Internal server error' } }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Invalid token' } }, { status: 401 });

    const userId = payload.sub;
    const { id } = await params;
    const body = await request.json();
    const { description, amount, paidBy } = body;

    if (!description || !amount || amount <= 0 || !paidBy) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'Invalid input' } }, { status: 400 });
    }

    const db = await getDb();
    const groupsCollection = db.collection('groups');
    const expensesCollection = db.collection('group-expenses');

    // Check if user is member and paidBy is valid
    const group = await groupsCollection.findOne({ _id: new ObjectId(id), members: { $all: [userId, paidBy] } });
    if (!group) {
      return NextResponse.json({ success: false, error: { code: 'not_found', message: 'Group not found or invalid paidBy' } }, { status: 404 });
    }

    const expense = {
      groupId: id,
      description,
      amount: parseFloat(amount),
      paidBy,
      createdAt: new Date()
    };

    const result = await expensesCollection.insertOne(expense);

    return NextResponse.json({
      success: true,
      data: {
        expense: {
          id: result.insertedId.toString(),
          ...expense,
          createdAt: expense.createdAt.toISOString()
        }
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { code: 'internal_error', message: 'Internal server error' } }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../../../lib/mongodb';
import { verifyToken } from '../../../../../../lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Invalid token' } }, { status: 401 });

    const userId = payload.sub;
    const { id } = await params;
    const body = await request.json();
    const { category } = body;

    if (!category) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'Category required' } }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('transactions');

    const result = await collection.updateOne(
      { _id: new ObjectId(id), userId },
      { $set: { category } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: { code: 'not_found', message: 'Transaction not found' } }, { status: 404 });
    }

    const updated = await collection.findOne({ _id: new ObjectId(id) });

    if (!updated) {
      return NextResponse.json({ success: false, error: { code: 'not_found', message: 'Transaction not found after update' } }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        transaction: {
          id: updated._id.toString(),
          date: updated.date.toISOString().split('T')[0],
          amount: updated.amount,
          currency: updated.currency,
          merchant: updated.merchant,
          category: updated.category,
          notes: updated.notes,
          split: updated.split,
          recurringId: updated.recurringId,
          receiptId: updated.receiptId,
          createdAt: updated.createdAt.toISOString()
        }
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { code: 'internal_error', message: 'Internal server error' } }, { status: 500 });
  }
}
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
    const { splits } = body;

    if (!splits || !Array.isArray(splits) || splits.length === 0) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'Splits required' } }, { status: 400 });
    }

    // Validate splits: each has amount or percentage, and sum to total
    const db = await getDb();
    const collection = db.collection('transactions');

    const transaction = await collection.findOne({ _id: new ObjectId(id), userId });
    if (!transaction) {
      return NextResponse.json({ success: false, error: { code: 'not_found', message: 'Transaction not found' } }, { status: 404 });
    }

    const totalAmount = Math.abs(transaction.amount); // use absolute for splitting
    let totalSplit = 0;

    for (const split of splits) {
      if (split.amount) {
        totalSplit += split.amount;
      } else if (split.percentage) {
        split.amount = (totalAmount * split.percentage) / 100;
        totalSplit += split.amount;
      } else {
        return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'Each split must have amount or percentage' } }, { status: 400 });
      }
    }

    if (Math.abs(totalSplit - totalAmount) > 0.01) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'Split amounts must sum to transaction amount' } }, { status: 400 });
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id), userId },
      { $set: { split: splits } }
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
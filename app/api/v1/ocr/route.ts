import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../lib/mongodb';
import { verifyToken } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Invalid token' } }, { status: 401 });

    const userId = payload.sub;

    const body = await request.json();
    const { receiptId } = body;

    if (!receiptId) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'receiptId required' } }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('receipts');

    const receipt = await collection.findOne({ _id: new ObjectId(receiptId), userId });
    if (!receipt) {
      return NextResponse.json({ success: false, error: { code: 'not_found', message: 'Receipt not found' } }, { status: 404 });
    }

    // Mock OCR extraction
    const extracted = {
      total: Math.random() * 100 + 10, // random amount
      date: new Date().toISOString().split('T')[0],
      vendor: 'Mock Vendor'
    };

    await collection.updateOne({ _id: new ObjectId(receiptId) }, { $set: { extracted } });

    return NextResponse.json({
      success: true,
      data: {
        receipt: {
          id: receiptId,
          fileUrl: receipt.fileUrl,
          extracted,
          createdAt: receipt.createdAt.toISOString()
        }
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { code: 'internal_error', message: 'Internal server error' } }, { status: 500 });
  }
}
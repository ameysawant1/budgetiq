import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { verifyToken } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Invalid token' } }, { status: 401 });

    const userId = payload.sub;

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'No file provided' } }, { status: 400 });
    }

    // Mock file storage - in real app, upload to S3
    const fileUrl = `https://mock-storage.com/${file.name}`;

    const db = await getDb();
    const collection = db.collection('receipts');

    const receipt = {
      userId,
      fileUrl,
      extracted: null, // will be filled by OCR
      createdAt: new Date()
    };

    const result = await collection.insertOne(receipt);

    return NextResponse.json({
      success: true,
      data: {
        receipt: {
          id: result.insertedId.toString(),
          ...receipt,
          createdAt: receipt.createdAt.toISOString()
        }
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { code: 'internal_error', message: 'Internal server error' } }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../lib/mongodb';
import { verifyToken } from '../../../../lib/auth';

interface GroupDocument {
  _id: ObjectId;
  creatorId: string;
  name: string;
  members: string[];
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
    const collection = db.collection('groups');

    const groups = await collection.find({ $or: [{ creatorId: userId }, { members: userId }] }).toArray() as GroupDocument[];

    return NextResponse.json({
      success: true,
      data: {
        groups: groups.map((g) => ({
          id: g._id.toString(),
          name: g.name,
          members: g.members,
          createdAt: g.createdAt.toISOString()
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
    const { name, members } = body;

    if (!name || !members || !Array.isArray(members) || members.length < 1) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'Invalid input' } }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('groups');

    const group = {
      creatorId: userId,
      name,
      members: [userId, ...members], // include creator
      createdAt: new Date()
    };

    const result = await collection.insertOne(group);

    return NextResponse.json({
      success: true,
      data: {
        group: {
          id: result.insertedId.toString(),
          ...group,
          createdAt: group.createdAt.toISOString()
        }
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { code: 'internal_error', message: 'Internal server error' } }, { status: 500 });
  }
}
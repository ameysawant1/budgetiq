import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../../lib/auth';
import { getDb } from '../../../../../lib/mongodb';

function parseTokenFromCookie(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|; )token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export async function GET(req: Request) {
  try {
    const token = parseTokenFromCookie(req);
    if (!token) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'no token' } }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'invalid token' } }, { status: 401 });

    const db = await getDb();
    const user = await db.collection('users').findOne({ id: payload.sub }, { projection: { passwordHash: 0, _id: 0 } });
    if (!user) return NextResponse.json({ success: false, error: { code: 'not_found', message: 'user not found' } }, { status: 404 });

    return NextResponse.json({ success: true, data: { user } });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: { code: 'server_error', message: errorMessage } }, { status: 500 });
  }
}

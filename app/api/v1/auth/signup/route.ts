import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '../../../../../lib/mongodb';
import { signToken } from '../../../../../lib/auth';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body || {};
    if (!email || !password) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'email and password are required' } }, { status: 400 });
    }

    const normalized = String(email).trim().toLowerCase();

    const db = await getDb();
    const existing = await db.collection('users').findOne({ email: normalized });
    if (existing) {
      return NextResponse.json({ success: false, error: { code: 'user_exists', message: 'user already exists' } }, { status: 409 });
    }

    const id = 'user_' + crypto.randomBytes(8).toString('hex');
    const passwordHash = hashPassword(String(password));
  const user = { id, email: normalized, name: name || '', passwordHash, createdAt: new Date().toISOString(), preferences: { currency: 'USD', locale: 'en-US' } };

    await db.collection('users').insertOne(user);

  const token = signToken({ sub: user.id, email: user.email });
  const cookieParts = [`token=${token}`, `Path=/`, `HttpOnly`, `SameSite=Lax`, `Max-Age=${7 * 24 * 60 * 60}`];
  if (process.env.NODE_ENV === 'production') cookieParts.push('Secure');
  const headers = { 'Set-Cookie': cookieParts.join('; ') };

  return NextResponse.json({ success: true, data: { user: { id: user.id, email: user.email, name: user.name, preferences: user.preferences }, token } }, { status: 201, headers });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: { code: 'server_error', message: errorMessage } }, { status: 500 });
  }
}

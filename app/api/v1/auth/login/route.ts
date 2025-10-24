import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { signToken } from '../../../../../lib/auth';
import crypto from 'crypto';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'email and password required' } }, { status: 400 });

    const db = await getDb();
    const user = await db.collection('users').findOne({ email: String(email).trim().toLowerCase() });
    if (!user) return NextResponse.json({ success: false, error: { code: 'invalid_credentials', message: 'invalid email or password' } }, { status: 401 });

    const passwordHash = hashPassword(String(password));
    if (user.passwordHash !== passwordHash) return NextResponse.json({ success: false, error: { code: 'invalid_credentials', message: 'invalid email or password' } }, { status: 401 });

  const token = signToken({ sub: user.id, email: user.email });
  const cookieParts = [`token=${token}`, `Path=/`, `HttpOnly`, `SameSite=Lax`, `Max-Age=${7 * 24 * 60 * 60}`];
  if (process.env.NODE_ENV === 'production') cookieParts.push('Secure');
  const headers = { 'Set-Cookie': cookieParts.join('; ') };
  return NextResponse.json({ success: true, data: { user: { id: user.id, email: user.email, name: user.name || '', preferences: user.preferences }, token } }, { headers });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: { code: 'server_error', message: errorMessage } }, { status: 500 });
  }
}

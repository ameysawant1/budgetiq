import { NextResponse } from 'next/server';

export async function POST() {
  // Clear the auth cookie
  const cookieParts = [`token=; Path=/; HttpOnly; Max-Age=0`, `SameSite=Lax`];
  if (process.env.NODE_ENV === 'production') cookieParts.push('Secure');
  const headers = { 'Set-Cookie': cookieParts.join('; ') };
  return NextResponse.json({ success: true, data: { ok: true } }, { headers });
}

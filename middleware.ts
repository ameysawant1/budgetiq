import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /dashboard/* routes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      verifyToken(token);
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
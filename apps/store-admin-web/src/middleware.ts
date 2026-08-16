import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'lm-store-token';
const PUBLIC_PATHS = ['/login', '/api/'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  // Always allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // No token → redirect to login
  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  // Dev bypass tokens (non-standard format) — allow through without JWT verify
  if (token.startsWith('dev.') && token.endsWith('.bypass')) {
    return NextResponse.next();
  }

  // Verify real JWT using jose (local — no network call)
  let payload: { role?: string; sub?: string };
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET ?? 'change-me-to-a-secure-random-secret-min-32-chars',
    );
    const { payload: p } = await jwtVerify(token, secret);
    payload = p as typeof payload;
  } catch {
    // Invalid/expired token
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  // Role gate
  if (payload.role !== 'STORE_OWNER') {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

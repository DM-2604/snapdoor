// src/app/api/auth/otp/verify/route.ts
// Proxies POST /auth/otp/verify to backend.
// Extracts accessToken and sets it as an httpOnly cookie.
// Returns { user } to the client — never the raw token.

import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    // Backend returns: { data: { accessToken, user }, meta }
    const payload = data?.data ?? data;
    const { accessToken, user } = payload;

    const response = NextResponse.json({ user });

    if (accessToken) {
      response.cookies.set('store_auth_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;
  } catch {
    return NextResponse.json({ message: 'Failed to reach auth service' }, { status: 502 });
  }
}

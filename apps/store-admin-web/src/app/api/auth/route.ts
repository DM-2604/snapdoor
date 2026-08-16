// apps/store-admin-web/src/app/api/auth/route.ts
// POST /api/auth  — verify OTP, set httpOnly cookie lm-store-token, return user
// DELETE /api/auth — sign out, clear cookie

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const COOKIE_NAME = 'lm-store-token';
const IS_DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_OTP_BYPASS === 'true';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otp } = await req.json();

    let accessToken: string | null = null;
    let user: { id: string; role: string; name?: string | null } | null = null;

    // DEV BYPASS: try real API first, fall back to mock token if API is offline
    if (IS_DEV_BYPASS && otp === '000000') {
      try {
        const apiRes = await fetch(`${API_URL}/api/v1/auth/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber, otp }),
          signal: AbortSignal.timeout(3000),
        });
        const body = await apiRes.json().catch(() => null);
        if (!apiRes.ok) {
          return NextResponse.json(
            { message: body?.message ?? 'OTP verification failed' },
            { status: apiRes.status },
          );
        }
        const data = body.data ?? body;
        accessToken = data.accessToken;
        user = data.user;
      } catch {
        // API offline — issue dev-only placeholder token
        accessToken = `dev.${Buffer.from(
          JSON.stringify({ sub: 'dev-store', role: 'STORE_OWNER', storeStatus: 'LIVE', phone: phoneNumber }),
        ).toString('base64')}.bypass`;
        user = { id: 'dev-store', role: 'STORE_OWNER' };
        console.warn('[/api/auth] ⚠️  API unreachable — using dev-only mock token.');
      }
    } else {
      // Standard flow
      const apiRes = await fetch(`${API_URL}/api/v1/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      });
      const body = await apiRes.json();
      if (!apiRes.ok) {
        return NextResponse.json(
          { message: body?.message ?? 'OTP verification failed' },
          { status: apiRes.status },
        );
      }
      const data = body.data ?? body;
      accessToken = data.accessToken;
      user = data.user;
    }

    // Role gate — only STORE_OWNER allowed here
    if (user?.role !== 'STORE_OWNER') {
      return NextResponse.json(
        { message: 'Access denied. Store owner accounts only.' },
        { status: 403 },
      );
    }

    if (!accessToken) {
      return NextResponse.json({ message: 'Failed to obtain token' }, { status: 500 });
    }

    const isProd = process.env.NODE_ENV === 'production';
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error('[/api/auth POST]', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}

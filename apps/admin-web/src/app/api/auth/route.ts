// apps/admin-web/app/api/auth/route.ts
// Next.js Route Handler — proxies OTP verify to the NestJS API and sets
// an httpOnly cookie so the access token is never accessible from JavaScript.
//
// POST /api/auth   — verify OTP, set cookie, return user info
// DELETE /api/auth — sign out, clear cookie
//
// DEV BYPASS: When NEXT_PUBLIC_DEV_OTP_BYPASS=true and otp='000000',
// the handler proxies to NestJS directly (which has its own bypass in
// identity.service.ts). If NestJS is also unreachable, a dev-only mock
// session is returned so the UI can be tested without the API running.

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const COOKIE_NAME = 'lm-admin-token';
const IS_DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_OTP_BYPASS === 'true';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otp } = await req.json();

    // ── DEV BYPASS FALLBACK ──────────────────────────────────────────────────
    // If the API is unreachable and OTP is the dev bypass code, issue a
    // local-only mock JWT so the UI can be explored without starting the API.
    // The token is intentionally non-standard — it won't pass NestJS JwtAuthGuard,
    // so API calls from admin pages will fail (as expected) until the API is started.
    if (IS_DEV_BYPASS && otp === '000000') {
      let accessToken: string | null = null;
      let user: { id: string; role: string } | null = null;

      // First: try the real API (NestJS also has the bypass)
      try {
        const apiRes = await fetch(`${API_URL}/api/v1/auth/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber, otp }),
          signal: AbortSignal.timeout(3000), // 3s timeout
        });

        const body = await apiRes.json().catch(() => null);

        if (!apiRes.ok) {
          // API is online but rejected the auth (e.g. invalid format)
          return NextResponse.json(
            { message: body?.message ?? 'OTP verification failed' },
            { status: apiRes.status },
          );
        }

        const data = body.data ?? body;
        accessToken = data.accessToken;
        user = data.user;
      } catch (err: any) {
        // API is offline (fetch threw error) — issue dev-only placeholder token
        accessToken = `dev.${Buffer.from(JSON.stringify({ sub: 'dev-admin', role: 'ADMIN', phone: phoneNumber })).toString('base64')}.bypass`;
        user = { id: 'dev-admin', role: 'ADMIN' };
        console.warn(
          '[/api/auth] ⚠️  NestJS API unreachable — using dev-only mock token. Start the API for real data.',
        );
      }

      // Enforce ADMIN role even for dev
      if (user?.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Access denied. Admin accounts only.' }, { status: 403 });
      }

      if (!accessToken) {
        return NextResponse.json({ message: 'Failed to generate token' }, { status: 500 });
      }

      const cookieStore = await cookies();
      cookieStore.set(COOKIE_NAME, accessToken as string, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 60,
      });

      return NextResponse.json({ user }, { status: 200 });
    }
    // ── END DEV BYPASS ────────────────────────────────────────────────────────

    // Standard flow: proxy to NestJS
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

    const { accessToken, user } = body.data ?? body;

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Access denied. Admin accounts only.' }, { status: 403 });
    }

    const isProd = process.env.NODE_ENV === 'production';
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, accessToken as string, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
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

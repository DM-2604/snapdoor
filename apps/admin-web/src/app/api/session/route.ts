// app/api/session/route.ts
// GET /api/session — returns the decoded user from the httpOnly cookie.
// Used by AdminLayoutClient on mount to hydrate useAuthStore after a page refresh.
// No sensitive data (no JWT, no raw token) is returned — only non-sensitive
// fields needed for UI decisions (name, role, adminRole).

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const COOKIE_NAME = 'lm-admin-token';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);

  if (!token?.value) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  // Forward the cookie to the NestJS /auth/me endpoint to get decoded user info.
  try {
    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token.value}` },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const body = await res.json();
    const user = body.data ?? body;

    // Return only non-sensitive fields needed by the UI
    return NextResponse.json({
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name ?? null,
        role: user.role,
        adminRole: user.adminRole ?? null,
      },
    });
  } catch {
    // API unreachable — return null user; the (admin)/layout.tsx server-side
    // guard already handles the redirect-to-login case via cookie presence check.
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

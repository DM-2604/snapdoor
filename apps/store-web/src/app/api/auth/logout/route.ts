// src/app/api/auth/logout/route.ts
// Clears the store_auth_token httpOnly cookie and calls backend logout.

import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('store_auth_token')?.value;

  // Best-effort backend logout (revoke session)
  if (token) {
    try {
      await fetch(`${BACKEND}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Ignore — cookie will be cleared anyway
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete('store_auth_token');
  return response;
}

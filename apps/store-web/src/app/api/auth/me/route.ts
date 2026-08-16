// src/app/api/auth/me/route.ts
// Reads store_auth_token cookie and returns the current user, or 401.

import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('store_auth_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 });
  }

  try {
    // Decode the JWT without verifying (for user info only — verification happens at backend)
    const [, payloadB64] = token.split('.');
    const payload = JSON.parse(
      Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'),
    );

    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      const response = NextResponse.json({ message: 'Token expired' }, { status: 401 });
      response.cookies.delete('store_auth_token');
      return response;
    }

    return NextResponse.json({
      id: payload.sub,
      phoneNumber: payload.phoneNumber ?? '',
      name: payload.name ?? null,
      role: payload.role ?? 'CUSTOMER',
    });
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}

// GET /api/session — decodes lm-store-token cookie and returns { user, store }

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const COOKIE_NAME = 'lm-store-token';

export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const profileRes = await fetch(`${API_URL}/api/v1/store/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!profileRes.ok) {
      return NextResponse.json({ message: 'Session expired' }, { status: 401 });
    }

    const body = await profileRes.json();
    const data = body.data ?? body;
    return NextResponse.json({ store: data.store, owner: data.owner }, { status: 200 });
  } catch (err) {
    console.error('[/api/session GET]', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

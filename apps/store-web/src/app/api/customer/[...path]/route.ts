// src/app/api/customer/[...path]/route.ts
// Generic authenticated proxy for all /api/v1/* customer endpoints.
// Reads store_auth_token httpOnly cookie and adds Authorization: Bearer header.
// This avoids exposing the JWT to client-side JS.

import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

type Ctx = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { path } = await ctx.params;
  const token = req.cookies.get('store_auth_token')?.value;

  // Build upstream URL — strip the /api/customer prefix
  const upstream = `${BACKEND}/${path.join('/')}${req.nextUrl.search}`;

  // Forward all headers except host, plus auth
  const headers: Record<string, string> = {
    'content-type': req.headers.get('content-type') ?? 'application/json',
  };
  if (token) headers['authorization'] = `Bearer ${token}`;

  // Forward custom headers (idempotency-key, etc.)
  req.headers.forEach((v, k) => {
    if (['host', 'cookie', 'content-length', 'content-type', 'authorization'].includes(k)) return;
    headers[k] = v;
  });

  const body =
    req.method !== 'GET' && req.method !== 'DELETE' && req.method !== 'HEAD'
      ? await req.text().catch(() => undefined)
      : undefined;

  try {
    const res = await fetch(upstream, {
      method: req.method,
      headers,
      body,
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        'content-type': res.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch (err) {
    console.error(`[customer-proxy] Failed to reach ${upstream}:`, err);
    return NextResponse.json({ message: 'Upstream unavailable' }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;

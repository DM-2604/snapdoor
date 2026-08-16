// apps/admin-web/app/api/proxy/[...path]/route.ts
// Proxy Route Handler for admin-web client calls.
// Proxies same-origin calls from /api/proxy/* to NestJS API (http://localhost:3001/api/v1/*).
// Reads the httpOnly 'lm-admin-token' cookie and attaches 'Authorization: Bearer <token>'.

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const COOKIE_NAME = 'lm-admin-token';
const IS_DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_OTP_BYPASS === 'true';

// Fallback mock responses matching exact API schemas when NestJS API is offline in dev mode
function getDevFallbackResponse(pathStr: string, method: string) {
  // Mutating operations shouldn't silently succeed with mock data
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    return null; // Will cause a 503 with clear message
  }
  if (pathStr.includes('dashboard')) {
    return {
      data: {
        stores: { PENDING: 0, LIVE: 0, REJECTED: 0, SUSPENDED: 0, DRAFT: 0 },
        totalDocumentsPending: 0,
        zonesPerCity: [],
        activeFeePlansCount: 0,
      },
    };
  }
  if (pathStr.includes('categories')) {
    return { data: [] };
  }
  if (pathStr.includes('stores')) {
    return { data: { items: [], total: 0, page: 1, limit: 20 } };
  }
  if (pathStr.includes('geo/cities') || pathStr.includes('zones')) {
    return { data: [] };
  }
  if (pathStr.includes('commission/rules') || pathStr.includes('fee-plans')) {
    return { data: [] };
  }
  if (pathStr.includes('audit-logs')) {
    return { data: { items: [], total: 0, page: 1, limit: 20 } };
  }
  return { data: [] };
}

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  let pathStr = resolvedParams.path.join('/');
  
  // Clean path to avoid duplicate api/v1 prefix
  if (pathStr.startsWith('api/v1/')) {
    pathStr = pathStr.replace(/^api\/v1\//, '');
  }

  const targetUrl = new URL(`${API_URL}/api/v1/${pathStr}`);
  
  req.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  const headers: Record<string, string> = {
    'Content-Type': req.headers.get('content-type') || 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body: any = undefined;
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    try {
      body = await req.text();
    } catch {}
  }

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      console.log(`[Proxy ${req.method} /${pathStr}] Payload:`, body);
    }

  // Mutations (store creation etc.) can take longer due to geo writes + audit logs
  const timeoutMs = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? 25000 : 15000;

  try {
    const apiRes = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body: body || undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });

    const responseData = await apiRes.text();

    if (apiRes.status === 400) {
      console.error(`[Proxy 400 Response]`, responseData);
    }

    return new NextResponse(responseData, {
      status: apiRes.status,
      headers: {
        'Content-Type': apiRes.headers.get('content-type') || 'application/json',
      },
    });
  } catch (err: any) {
    if (IS_DEV_BYPASS) {
      console.warn(`[/api/proxy] ⚠️  NestJS API unreachable for ${req.method} /${pathStr}.`);
      const mockData = getDevFallbackResponse(pathStr, req.method);
      if (!mockData) {
        // Don't fake success for mutations — tell the user the API is down
        return NextResponse.json(
          { message: `API server offline. Cannot ${req.method} /${pathStr}. Start the API with: npm run dev:api`, error: 'API_OFFLINE' },
          { status: 503 },
        );
      }
      return NextResponse.json(mockData, { status: 200 });
    }

    console.error('[/api/proxy error]', err.message);
    return NextResponse.json({ message: 'API proxy request failed', error: err.message }, { status: 502 });
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, context);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, context);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, context);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, context);
}

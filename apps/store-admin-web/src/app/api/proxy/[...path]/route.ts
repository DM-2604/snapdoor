// apps/store-admin-web/src/app/api/proxy/[...path]/route.ts
// Proxies same-origin calls from /api/proxy/* to NestJS.
// Reads the httpOnly 'lm-store-token' cookie and attaches Authorization header.

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const COOKIE_NAME = 'lm-store-token';
const IS_DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_OTP_BYPASS === 'true';

function getDevFallbackResponse(pathStr: string, method: string) {
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) return null;
  if (pathStr.includes('profile')) {
    return {
      data: {
        store: { id: 'dev-store', name: 'Dev Store', status: 'LIVE', isOpen: true, isPaused: false, description: null, address: null },
        owner: { id: 'dev-owner', userId: 'dev-user', storeId: 'dev-store' },
        documents: [],
      },
    };
  }
  if (pathStr.includes('products')) return { data: { items: [], total: 0, page: 1 } };
  if (pathStr.includes('kyc-status')) {
    return { data: { storeStatus: 'LIVE', documents: [], requiredDocs: ['PAN', 'GST_CERTIFICATE', 'SHOP_LICENSE'], allRequiredUploaded: false } };
  }
  if (pathStr.includes('documents')) return { data: [] };
  if (pathStr.includes('orders')) return { data: { items: [], total: 0, page: 1 } };
  return { data: [] };
}

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  let pathStr = resolvedParams.path.join('/');

  if (pathStr.startsWith('api/v1/')) pathStr = pathStr.replace(/^api\/v1\//, '');

  const targetUrl = new URL(`${API_URL}/api/v1/${pathStr}`);
  req.nextUrl.searchParams.forEach((value, key) => targetUrl.searchParams.append(key, value));

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  const headers: Record<string, string> = {
    'Content-Type': req.headers.get('content-type') || 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let body: string | undefined;
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    try { body = await req.text(); } catch {}
  }

  const timeoutMs = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? 15000 : 4000;

  try {
    const apiRes = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body: body || undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
    const responseData = await apiRes.text();
    return new NextResponse(responseData, {
      status: apiRes.status,
      headers: { 'Content-Type': apiRes.headers.get('content-type') || 'application/json' },
    });
  } catch (err: any) {
    if (IS_DEV_BYPASS) {
      const mockData = getDevFallbackResponse(pathStr, req.method);
      if (!mockData) {
        return NextResponse.json(
          { message: `API offline. Cannot ${req.method} /${pathStr}. Run: npm run dev:api`, error: 'API_OFFLINE' },
          { status: 503 },
        );
      }
      return NextResponse.json(mockData, { status: 200 });
    }
    return NextResponse.json({ message: 'API proxy request failed', error: err.message }, { status: 502 });
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxyRequest(req, ctx); }
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxyRequest(req, ctx); }
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxyRequest(req, ctx); }
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxyRequest(req, ctx); }
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) { return proxyRequest(req, ctx); }

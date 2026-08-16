// packages/api-client/src/client.ts
// Thin fetch wrapper for the LocalMart API.
//
// - Unwraps { data, meta } envelope from TransformInterceptor
// - Attaches Bearer JWT from a configurable token getter
// - Returns typed responses

export interface ApiClientOptions {
  baseUrl: string;
  /** Returns the current access token (or null if unauthenticated) */
  getToken: () => string | null;
  /** Called when the server returns 401 — use to redirect to login */
  onUnauthorized?: () => void;
}

export interface ApiMeta {
  timestamp: string;
  path: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getToken: () => string | null;
  private readonly onUnauthorized?: () => void;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.getToken = options.getToken;
    this.onUnauthorized = options.onUnauthorized;
  }

  async get<T>(path: string, query?: Record<string, string | number | undefined>, options?: RequestInit): Promise<T> {
    const url = this.buildUrl(path, query);
    const res = await fetch(url, { ...options, headers: { ...options?.headers, ...this.headers() } });
    return this.unwrap<T>(res);
  }

  async post<T>(path: string, body?: unknown, options?: { idempotencyKey?: string; headers?: Record<string, string> }): Promise<T> {
    const extraHeaders: Record<string, string> = {};
    if (options?.idempotencyKey) extraHeaders['idempotency-key'] = options.idempotencyKey;
    if (options?.headers) Object.assign(extraHeaders, options.headers);
    const res = await fetch(this.buildUrl(path), {
      method: 'POST',
      headers: { ...this.headers(), 'Content-Type': 'application/json', ...extraHeaders },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.unwrap<T>(res);
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(this.buildUrl(path), {
      method: 'PATCH',
      headers: { ...this.headers(), 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.unwrap<T>(res);
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(this.buildUrl(path), {
      method: 'PUT',
      headers: { ...this.headers(), 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.unwrap<T>(res);
  }

  async delete<T>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
    const res = await fetch(this.buildUrl(path, query), {
      method: 'DELETE',
      headers: this.headers(),
    });
    return this.unwrap<T>(res);
  }


  private buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
    const cleanPath = path.replace(/^\//, '');
    const fullPath = `${this.baseUrl}/${cleanPath}`;
    const url = typeof window !== 'undefined' && !fullPath.startsWith('http')
      ? new URL(fullPath, window.location.origin)
      : new URL(fullPath);
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined) url.searchParams.set(k, String(v));
      });
    }
    return url.toString();
  }

  private headers(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async unwrap<T>(res: Response): Promise<T> {
    // 204 No Content — no body to parse
    if (res.status === 204) return undefined as T;
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      // Auto-redirect on 401 if handler provided
      if (res.status === 401 && this.onUnauthorized) {
        this.onUnauthorized();
      }
      const message = json?.message ?? `HTTP ${res.status}`;
      throw new Error(Array.isArray(message) ? message.join('; ') : String(message));
    }
    // Unwrap { data, meta } envelope from TransformInterceptor
    return (json as ApiResponse<T>).data;
  }
}

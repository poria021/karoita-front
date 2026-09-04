import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import {
  forwardToNestApi,
  nestProxyResponseBody,
} from '@/lib/nest-proxy-forward';

describe('nestProxyResponseBody', () => {
  const payload = new TextEncoder().encode('{"title":"tehran"}').buffer;

  it('drops the body for 204/205/304 so NextResponse cannot throw', () => {
    expect(nestProxyResponseBody(204, payload)).toBeNull();
    expect(nestProxyResponseBody(205, payload)).toBeNull();
    expect(nestProxyResponseBody(304, payload)).toBeNull();
    expect(nestProxyResponseBody(204, new ArrayBuffer(0))).toBeNull();
  });

  it('keeps the body for ordinary success and error statuses', () => {
    expect(nestProxyResponseBody(200, payload)).toBe(payload);
    expect(nestProxyResponseBody(201, payload)).toBe(payload);
    expect(nestProxyResponseBody(422, payload)).toBe(payload);
  });
});

describe('forwardToNestApi', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('rejects path traversal', async () => {
    const req = new NextRequest('http://localhost/api/nest/v1/auth');
    const res = await forwardToNestApi(req, ['..', 'etc']);
    expect(res.status).toBe(400);
  });

  it('returns 502 when Nest URL is not configured', async () => {
    vi.stubEnv('BACKEND_INTERNAL_URL', '');
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    const req = new NextRequest('http://localhost/api/nest/v1/auth/roles');
    const res = await forwardToNestApi(req, ['v1', 'auth', 'roles']);
    expect(res.status).toBe(502);
  });

  it('proxies to BACKEND_INTERNAL_URL at request time', async () => {
    vi.stubEnv('BACKEND_INTERNAL_URL', 'https://nest.internal/api');
    const nestFetch = vi.fn().mockResolvedValue(
      new Response('{"ok":true}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', nestFetch);

    const req = new NextRequest('http://localhost/api/nest/v1/auth/roles', {
      headers: { authorization: 'Bearer t', cookie: 'secret=1' },
    });
    const res = await forwardToNestApi(req, ['v1', 'auth', 'roles']);

    expect(res.status).toBe(200);
    expect(nestFetch).toHaveBeenCalledTimes(1);
    const [url, init] = nestFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://nest.internal/api/v1/auth/roles');
    const headers = new Headers(init.headers);
    expect(headers.get('authorization')).toBe('Bearer t');
    expect(headers.get('cookie')).toBeNull();
    expect(headers.get('accept-encoding')).toBe('identity');
  });

  it('does not forward the browser Accept-Encoding to Nest', async () => {
    vi.stubEnv('BACKEND_INTERNAL_URL', 'https://nest.internal/api');
    const nestFetch = vi.fn().mockResolvedValue(
      new Response('{"ok":true}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', nestFetch);

    const req = new NextRequest('http://localhost/api/nest/v1/auth/roles', {
      headers: { 'accept-encoding': 'gzip, deflate, br' },
    });
    await forwardToNestApi(req, ['v1', 'auth', 'roles']);

    const [, init] = nestFetch.mock.calls[0] as [string, RequestInit];
    expect(new Headers(init.headers).get('accept-encoding')).toBe('identity');
  });

  it('strips content-encoding from upstream response to prevent ERR_CONTENT_DECODING_FAILED', async () => {
    vi.stubEnv('BACKEND_INTERNAL_URL', 'https://nest.internal/api');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('{"ok":true}', {
          status: 200,
          headers: {
            'content-type': 'application/json',
            'content-encoding': 'gzip',
            'x-powered-by': 'Express',
          },
        })
      )
    );

    const req = new NextRequest('http://localhost/api/nest/v1/auth/roles');
    const res = await forwardToNestApi(req, ['v1', 'auth', 'roles']);

    expect(res.status).toBe(200);
    expect(res.headers.get('content-encoding')).toBeNull();
    expect(res.headers.get('content-type')).toBe('application/json');
    expect(res.headers.get('x-powered-by')).toBeNull();
    expect(res.headers.get('x-karvita-proxy')).toBe('nest-raw');
    expect(res.headers.get('cache-control')).toBe('no-store, no-transform');
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it('forwards Nest 204 with a body as a real 204 without throwing', async () => {
    vi.stubEnv('BACKEND_INTERNAL_URL', 'https://nest.internal/api');
    const payload = new TextEncoder().encode('{"title":"tehran"}');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 204,
        headers: new Headers({
          'content-type': 'application/json',
          etag: 'W/"80-l3vj2/XZnebeBAhCvCVk+lgG6ww"',
        }),
        arrayBuffer: async () => payload.buffer,
      })
    );

    const req = new NextRequest('http://localhost/api/nest/admin/provinces', {
      method: 'POST',
    });
    const res = await forwardToNestApi(req, ['admin', 'provinces']);

    expect(res.status).toBe(204);
    await expect(res.text()).resolves.toBe('');
  });

  it('forwards Nest 204 with an empty body without throwing', async () => {
    vi.stubEnv('BACKEND_INTERNAL_URL', 'https://nest.internal/api');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    );

    const req = new NextRequest('http://localhost/api/nest/admin/provinces/1', {
      method: 'PATCH',
    });
    const res = await forwardToNestApi(req, ['admin', 'provinces', '1']);

    expect(res.status).toBe(204);
  });
});

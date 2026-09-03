import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { forwardToNestApi } from '@/lib/nest-proxy-forward';

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
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://nest.test';
  delete process.env.BACKEND_INTERNAL_URL;
});

import { POST } from '@/app/api/auth/refresh/route';
import {
  LEGACY_ACCESS_COOKIE_NAME,
  REAL_REFRESH_COOKIE_NAME,
  REAL_SURFACE_COOKIE_NAME,
} from '@/lib/real-auth-cookie';

function refreshRequest(): NextRequest {
  return new NextRequest('http://localhost/api/auth/refresh', {
    method: 'POST',
    headers: {
      'sec-fetch-site': 'same-origin',
      cookie: `${REAL_REFRESH_COOKIE_NAME}=refresh-cookie; ${REAL_SURFACE_COOKIE_NAME}=user; ${LEGACY_ACCESS_COOKIE_NAME}=stale-access`,
    },
  });
}

describe('POST /api/auth/refresh', () => {
  const nestFetch = vi.fn();

  beforeEach(() => {
    nestFetch.mockReset();
    vi.stubGlobal('fetch', nestFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends the refresh cookie as Bearer and never the leftover access cookie', async () => {
    nestFetch.mockResolvedValue(
      new Response(JSON.stringify({ token: 'new-access', refreshToken: 'rotated-rt' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    await POST(refreshRequest());

    expect(nestFetch).toHaveBeenCalled();
    const [url, init] = nestFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('v1/auth/refresh');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer refresh-cookie'
    );
  });

  it('on Nest 401 deletes refresh, surface, and leftover karvita_at', async () => {
    nestFetch.mockResolvedValue(new Response('expired', { status: 401 }));

    const response = await POST(refreshRequest());

    expect(response.status).toBe(401);
    const names = response.cookies.getAll().map((cookie) => cookie.name);
    expect(names).toEqual(
      expect.arrayContaining([
        REAL_REFRESH_COOKIE_NAME,
        REAL_SURFACE_COOKIE_NAME,
        LEGACY_ACCESS_COOKIE_NAME,
      ])
    );
  });

  it('on Nest 5xx does not delete session cookies', async () => {
    nestFetch.mockResolvedValue(new Response('busy', { status: 502 }));

    const response = await POST(refreshRequest());

    expect(response.status).toBe(502);
    expect(response.cookies.getAll()).toHaveLength(0);
  });
});

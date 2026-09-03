import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/auth/clear-tokens/route';
import {
  LEGACY_ACCESS_COOKIE_NAME,
  REAL_REFRESH_COOKIE_NAME,
  REAL_SURFACE_COOKIE_NAME,
} from '@/lib/real-auth-cookie';

describe('POST /api/auth/clear-tokens', () => {
  it('expires refresh, surface, and leftover karvita_at', async () => {
    const request = new NextRequest('http://localhost/api/auth/clear-tokens', {
      method: 'POST',
      headers: { 'sec-fetch-site': 'same-origin' },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const names = response.cookies.getAll().map((cookie) => cookie.name);
    expect(names).toEqual(
      expect.arrayContaining([
        REAL_REFRESH_COOKIE_NAME,
        REAL_SURFACE_COOKIE_NAME,
        LEGACY_ACCESS_COOKIE_NAME,
      ])
    );
    for (const name of names) {
      const cookie = response.cookies.get(name);
      expect(cookie?.value === '' || cookie?.value === undefined || Number(cookie.maxAge) === 0).toBe(
        true
      );
    }
  });
});

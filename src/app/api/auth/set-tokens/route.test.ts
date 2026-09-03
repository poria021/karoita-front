import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/auth/set-tokens/route';
import {
  LEGACY_ACCESS_COOKIE_NAME,
  REAL_REFRESH_COOKIE_NAME,
  REAL_SURFACE_COOKIE_NAME,
} from '@/lib/real-auth-cookie';

function sameOriginRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/auth/set-tokens', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'sec-fetch-site': 'same-origin',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/set-tokens', () => {
  it('sets karvita_rt and surface and does not write karvita_at', async () => {
    const response = await POST(
      sameOriginRequest({
        refreshToken: 'refresh-1',
        accessToken: 'access-should-be-ignored',
        surface: 'user',
      })
    );

    expect(response.status).toBe(200);
    expect(response.cookies.get(REAL_REFRESH_COOKIE_NAME)?.value).toBe('refresh-1');
    expect(response.cookies.get(REAL_SURFACE_COOKIE_NAME)?.value).toBe('user');
    expect(response.cookies.get(LEGACY_ACCESS_COOKIE_NAME)).toBeUndefined();
  });
});

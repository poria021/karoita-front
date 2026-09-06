import { describe, expect, it } from 'vitest';

import {
  decideUnauthorizedAfterResponse,
  KY_RETRY_LIMIT,
  KY_TIMEOUT_MS,
  resolveNestClientPrefix,
} from '@/services/api-client-config';
import { NEST_BROWSER_PROXY_PATH } from '@/lib/nest-proxy';

describe('api-client real Nest transport contract', () => {
  it('keeps ky retry.limit at 1 so POST/PATCH bodies survive 401 refresh', () => {
    expect(KY_RETRY_LIMIT).toBe(1);
  });

  it('caps Nest JSON timeout below 30s so a hung API does not freeze the UI', () => {
    expect(KY_TIMEOUT_MS).toBe(20_000);
    expect(KY_TIMEOUT_MS).toBeGreaterThan(0);
    expect(KY_TIMEOUT_MS).toBeLessThan(30_000);
  });

  it('uses the same-origin proxy when Nest lives on another origin', () => {
    expect(
      resolveNestClientPrefix({
        apiUrl: 'https://backend.example.com/api',
        windowOrigin: 'http://localhost:3000',
      })
    ).toBe(`http://localhost:3000${NEST_BROWSER_PROXY_PATH}`);
  });

  it('uses the same-origin proxy when the Nest URL is missing from the client bundle', () => {
    expect(
      resolveNestClientPrefix({
        apiUrl: '',
        windowOrigin: 'https://karoita.darkube.ir',
      })
    ).toBe(`https://karoita.darkube.ir${NEST_BROWSER_PROXY_PATH}`);
  });

  it('uses NEXT_PUBLIC_API_URL on SSR and same-origin browser', () => {
    expect(
      resolveNestClientPrefix({
        apiUrl: 'https://backend.example.com/api',
      })
    ).toBe('https://backend.example.com/api');
    expect(
      resolveNestClientPrefix({
        apiUrl: 'https://app.example.com/api',
        windowOrigin: 'https://app.example.com',
      })
    ).toBe('https://app.example.com/api');
  });

  it('refreshes once on 401, ignores retry 401 (permission issue), logs out on bootstrap URL', () => {
    expect(
      decideUnauthorizedAfterResponse({
        status: 200,
        retryCount: 0,
        url: '/api/nest/v1/users',
      })
    ).toBe('ignore');

    expect(
      decideUnauthorizedAfterResponse({
        status: 401,
        retryCount: 0,
        url: '/api/nest/v1/users',
      })
    ).toBe('refresh');

    // refresh موفق شد ولی retry هم 401 → permission issue، logout نکن
    expect(
      decideUnauthorizedAfterResponse({
        status: 401,
        retryCount: 1,
        url: '/api/nest/v1/users',
      })
    ).toBe('ignore');

    expect(
      decideUnauthorizedAfterResponse({
        status: 401,
        retryCount: 0,
        url: '/api/nest/v1/auth/refresh',
      })
    ).toBe('logout');

    expect(
      decideUnauthorizedAfterResponse({
        status: 401,
        retryCount: 0,
        url: '/api/nest/v1/admin/auth/me',
      })
    ).toBe('refresh');
  });
});

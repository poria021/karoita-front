import { describe, expect, it } from 'vitest';

import { ApiClientError } from '@/services/api-error';

import { makeQueryClient } from './query-client';

describe('makeQueryClient retry', () => {
  const retry = makeQueryClient().getDefaultOptions().queries?.retry as (
    failureCount: number,
    error: unknown
  ) => boolean;

  it('خطای ۴۰۱ / ۴۰۳ / ۴۰۴ را دوباره نمی‌زند', () => {
    for (const status of [401, 403, 404]) {
      expect(retry(0, new ApiClientError('x', status))).toBe(false);
    }
  });

  it('خطای گذرا (۵xx، ۴۰۸، ۴۲۹، شبکه) را یک‌بار تکرار می‌کند', () => {
    for (const status of [500, 502, 408, 429]) {
      expect(retry(0, new ApiClientError('x', status))).toBe(true);
    }
    expect(retry(0, new ApiClientError('network'))).toBe(true);
    expect(retry(0, new Error('boom'))).toBe(true);
  });

  it('بیش از یک تلاش مجدد نمی‌کند', () => {
    expect(retry(1, new ApiClientError('x', 500))).toBe(false);
  });
});

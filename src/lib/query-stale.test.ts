import { describe, expect, it } from 'vitest';

import { QUERY_STALE_MS } from '@/lib/query-stale';
import { unknownErrorMessage } from '@/lib/unknown-error-message';

describe('QUERY_STALE_MS', () => {
  it('keeps list fresher than module/cms snapshots', () => {
    expect(QUERY_STALE_MS.list).toBeLessThan(QUERY_STALE_MS.module);
    expect(QUERY_STALE_MS.list).toBeLessThan(QUERY_STALE_MS.cms);
    expect(QUERY_STALE_MS.list).toBeGreaterThan(0);
  });
});

describe('unknownErrorMessage', () => {
  it('prefers Error.message when present', () => {
    expect(unknownErrorMessage(new Error('سرویس قطع است'), 'fallback')).toBe(
      'سرویس قطع است'
    );
  });

  it('falls back for non-Error or empty message', () => {
    expect(unknownErrorMessage('x', 'بارگذاری ناموفق بود.')).toBe(
      'بارگذاری ناموفق بود.'
    );
    expect(unknownErrorMessage(new Error(''), 'بارگذاری ناموفق بود.')).toBe(
      'بارگذاری ناموفق بود.'
    );
  });
});

import { describe, expect, it } from 'vitest';

import {
  parseSentryDsn,
  sentryConnectOriginsFromEnv,
} from '@/lib/observability/parseSentryDsn';

describe('parseSentryDsn', () => {
  it('extracts store URL and origin from a public DSN', () => {
    const parsed = parseSentryDsn(
      'https://abc123@o0.ingest.sentry.io/4500000000000000'
    );
    expect(parsed).toEqual({
      publicKey: 'abc123',
      host: 'o0.ingest.sentry.io',
      projectId: '4500000000000000',
      origin: 'https://o0.ingest.sentry.io',
      storeUrl: 'https://o0.ingest.sentry.io/api/4500000000000000/store/',
    });
  });

  it('returns null for empty or invalid values', () => {
    expect(parseSentryDsn(undefined)).toBeNull();
    expect(parseSentryDsn('')).toBeNull();
    expect(parseSentryDsn('not-a-url')).toBeNull();
    expect(parseSentryDsn('https://ingest.sentry.io/1')).toBeNull();
  });
});

describe('sentryConnectOriginsFromEnv', () => {
  it('returns no origins when DSN is unset', () => {
    expect(sentryConnectOriginsFromEnv(undefined)).toEqual([]);
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';

import { reportError } from '@/lib/observability/reportError';

describe('reportError', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('logs and posts to the webhook when configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_ERROR_WEBHOOK_URL', 'https://hooks.example/errors');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await reportError(new Error('boom'), { source: 'test', path: '/x' });

    expect(spy).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://hooks.example/errors');
    const body = JSON.parse(String(init.body)) as { message: string; type: string };
    expect(body.type).toBe('error');
    expect(body.message).toBe('boom');
  });

  it('does not fetch when no reporter env is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_ERROR_WEBHOOK_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await reportError('plain');

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';

describe('fetchNestUpstream', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('uses global fetch under Vitest so route tests can stub it', async () => {
    vi.stubEnv('VITEST', 'true');
    const nestFetch = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
    vi.stubGlobal('fetch', nestFetch);

    const { fetchNestUpstream } = await import('@/lib/nest-upstream-fetch');
    const res = await fetchNestUpstream('https://nest.example/api/v1/ping', {
      method: 'GET',
    });

    expect(res.status).toBe(200);
    expect(nestFetch).toHaveBeenCalledTimes(1);
    expect(nestFetch.mock.calls[0]?.[0]).toBe('https://nest.example/api/v1/ping');
  });
});

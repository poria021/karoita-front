import { afterEach, describe, expect, it, vi } from 'vitest';

import { readNestApiBaseUrl } from '@/lib/nest-proxy';

describe('readNestApiBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prefers BACKEND_INTERNAL_URL so Darkube runtime env works after build', () => {
    vi.stubEnv('BACKEND_INTERNAL_URL', 'https://nest.internal/api/');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://public.example/api');
    expect(readNestApiBaseUrl()).toBe('https://nest.internal/api');
  });

  it('falls back to NEXT_PUBLIC_API_URL via dynamic env access', () => {
    vi.stubEnv('BACKEND_INTERNAL_URL', '');
    vi.stubEnv('NEST_API_URL', '');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://backenddev.darkube.ir/api');
    expect(readNestApiBaseUrl()).toBe('https://backenddev.darkube.ir/api');
  });

  it('uses NEST_API_URL before NEXT_PUBLIC_API_URL', () => {
    vi.stubEnv('BACKEND_INTERNAL_URL', '');
    vi.stubEnv('NEST_API_URL', 'https://nest.svc/api');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://public.example/api');
    expect(readNestApiBaseUrl()).toBe('https://nest.svc/api');
  });
});

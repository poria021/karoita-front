import { afterEach, describe, expect, it, vi } from 'vitest';

import { absoluteSiteUrl, getSiteUrl } from '@/lib/site-seo';

describe('site-seo', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prefers NEXT_PUBLIC_SITE_URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://karvita.example');
    vi.stubEnv('VERCEL_URL', 'ignored.vercel.app');
    expect(getSiteUrl().origin).toBe('https://karvita.example');
    expect(absoluteSiteUrl('/')).toBe('https://karvita.example/');
  });

  it('adds https to host-only NEXT_PUBLIC_SITE_URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'karvita.ir');
    expect(getSiteUrl().origin).toBe('https://karvita.ir');
  });

  it('falls back to VERCEL_URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('VERCEL_URL', 'app.vercel.app');
    expect(getSiteUrl().origin).toBe('https://app.vercel.app');
  });

  it('defaults to localhost when unset', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('VERCEL_URL', '');
    expect(getSiteUrl().origin).toBe('http://localhost:3000');
  });
});

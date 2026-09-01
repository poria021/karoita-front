import { describe, expect, it } from 'vitest';

import { DEFAULT_LOGIN_REDIRECT } from '@/lib/config';
import { isNavigableAppPath } from '@/lib/live-nav-paths';
import { config, proxy } from '@/proxy';
import { RouteService } from '@/services/route.service';

/**
 * قرارداد Edge در Next ۱۶: `src/proxy.ts` (نه `middleware.ts`).
 * وجود هر دو فایل بیلد را fail می‌کند. `config.matcher` باید export محلی همین ماژول بماند.
 */
describe('Edge proxy convention (Next.js 16)', () => {
  it('exports a named proxy function (not default-only)', () => {
    expect(typeof proxy).toBe('function');
  });

  it('exports a non-empty matcher so the session gate is not skipped', () => {
    const matcher = config.matcher;
    expect(Array.isArray(matcher)).toBe(true);
    expect(matcher.length).toBeGreaterThan(0);
    expect(matcher.some((rule) => rule.includes('_next'))).toBe(true);
  });

  it('uses a live dashboard path as the logged-in auth-route fallback', () => {
    expect(DEFAULT_LOGIN_REDIRECT).toBe(RouteService.karvita.dashboard());
    expect(isNavigableAppPath(DEFAULT_LOGIN_REDIRECT)).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';

import { config, proxy } from '@/proxy';

/**
 * Next.js 16 Edge convention: `src/proxy.ts` (not `middleware.ts`).
 * Both files together fail the build. `config.matcher` is statically
 * extracted from this module — it must stay a local export.
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
});

import { describe, expect, it } from 'vitest';

import { buildContentSecurityPolicy } from '@/lib/content-security-policy';

describe('buildContentSecurityPolicy', () => {
  it('allows inline scripts required by Next.js App Router hydration', () => {
    const csp = buildContentSecurityPolicy();
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("worker-src 'self'");
  });

  it('blocks inline event-handler attributes without removing hydration scripts', () => {
    const csp = buildContentSecurityPolicy();
    expect(csp).toContain("script-src-attr 'none'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
  });
});

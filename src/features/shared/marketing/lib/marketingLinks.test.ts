import { describe, expect, it } from 'vitest';

import { RouteService } from '@/services/route.service';

import {
  resolveMarketingLoginHref,
  resolveMarketingNavTarget,
} from './marketingLinks';

describe('resolveMarketingNavTarget', () => {
  it('classifies absolute http(s) as external', () => {
    expect(resolveMarketingNavTarget('https://eitaa.com')).toEqual({
      kind: 'external',
      href: 'https://eitaa.com',
    });
  });

  it('classifies marketing paths as internal', () => {
    expect(
      resolveMarketingNavTarget(RouteService.marketing.about())
    ).toEqual({
      kind: 'internal',
      href: '/about',
    });
  });

  it('returns none for empty link', () => {
    expect(resolveMarketingNavTarget('')).toEqual({ kind: 'none' });
  });
});

describe('resolveMarketingLoginHref', () => {
  it('routes to login-select when two or more products exist', () => {
    expect(resolveMarketingLoginHref(2)).toBe(
      RouteService.marketing.loginSelect()
    );
    expect(resolveMarketingLoginHref(4)).toBe(
      RouteService.marketing.loginSelect()
    );
  });

  it('skips login-select when fewer than two products exist', () => {
    expect(resolveMarketingLoginHref(0)).toBe(RouteService.auth.login());
    expect(resolveMarketingLoginHref(1)).toBe(RouteService.auth.login());
  });
});

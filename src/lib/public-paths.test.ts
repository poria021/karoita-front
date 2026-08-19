import { describe, expect, it } from 'vitest';

import { isPublicPath } from '@/lib/public-paths';
import { RouteService } from '@/services/route.service';

describe('isPublicPath', () => {
  it('allows marketing home and login-select', () => {
    expect(isPublicPath(RouteService.marketing.home())).toBe(true);
    expect(isPublicPath(RouteService.marketing.loginSelect())).toBe(true);
    expect(isPublicPath(RouteService.marketing.offline())).toBe(true);
  });

  it('allows public CMS pages under /p', () => {
    expect(isPublicPath(RouteService.marketing.cmsPagesBase())).toBe(true);
    expect(isPublicPath(RouteService.marketing.cmsPage('about'))).toBe(true);
    expect(isPublicPath('/p/foo/bar')).toBe(true);
  });

  it('does not treat removed marketing leaves as public', () => {
    expect(isPublicPath('/about')).toBe(false);
    expect(isPublicPath('/benefits')).toBe(false);
    expect(isPublicPath('/internship')).toBe(false);
    expect(isPublicPath('/advantages')).toBe(false);
  });

  it('allows the Nest browser proxy prefix', () => {
    expect(isPublicPath('/__nest-api/v1/auth/roles')).toBe(true);
  });

  it('blocks dashboard shell paths', () => {
    expect(isPublicPath(RouteService.karvita.dashboard())).toBe(false);
    expect(isPublicPath(RouteService.karvita.landingCms())).toBe(false);
  });
});

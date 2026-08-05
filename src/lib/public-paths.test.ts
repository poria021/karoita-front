import { describe, expect, it } from 'vitest';

import { isPublicPath } from '@/lib/public-paths';
import { RouteService } from '@/services/route.service';

describe('isPublicPath', () => {
  it('allows marketing home, leaves, and login-select', () => {
    expect(isPublicPath(RouteService.marketing.home())).toBe(true);
    expect(isPublicPath(RouteService.marketing.about())).toBe(true);
    expect(isPublicPath(RouteService.marketing.benefits())).toBe(true);
    expect(isPublicPath(RouteService.marketing.internship())).toBe(true);
    expect(isPublicPath(RouteService.marketing.advantages())).toBe(true);
    expect(isPublicPath(RouteService.marketing.loginSelect())).toBe(true);
  });

  it('allows auth tree and docs prefix', () => {
    expect(isPublicPath(RouteService.auth.login())).toBe(true);
    expect(isPublicPath('/docs/guide')).toBe(true);
  });

  it('blocks dashboard shell paths', () => {
    expect(isPublicPath(RouteService.karvita.dashboard())).toBe(false);
    expect(isPublicPath(RouteService.karvita.landingCms())).toBe(false);
  });
});

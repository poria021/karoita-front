import { describe, expect, it } from 'vitest';

import {
  dashboardModuleMetadata,
  resolveDashboardModulePath,
} from '@/lib/dashboard-module-metadata';
import { RouteService } from '@/services/route.service';

describe('dashboard-module-metadata', () => {
  it('maps live module keys to RouteService paths', () => {
    expect(resolveDashboardModulePath('daily-approvals')).toBe(
      RouteService.karvita.dailyApprovals()
    );
    expect(resolveDashboardModulePath('organizational-structure')).toBe(
      RouteService.karvita.organizationalStructure()
    );
  });

  it('builds noindex metadata from moduleMeta titles', () => {
    const meta = dashboardModuleMetadata('onboarding-approvals');
    expect(meta.title).toBe('بررسی مدارک هویتی ثبت‌نام');
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it('uses the landing CMS module title from moduleMeta', () => {
    expect(dashboardModuleMetadata('landing-cms').title).toBe(
      'مدیریت محتوای لندینگ'
    );
  });
});

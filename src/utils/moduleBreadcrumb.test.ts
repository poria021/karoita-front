import { describe, expect, it } from 'vitest';

import { RouteService } from '@/services/route.service';
import { getModuleBreadcrumb } from '@/utils/moduleBreadcrumb';

describe('getModuleBreadcrumb', () => {
  it('shows only the home crumb on admin dashboard', () => {
    expect(
      getModuleBreadcrumb(RouteService.karvita.adminDashboard(), 'super_admin')
    ).toEqual([{ label: 'میز کار مدیریت' }]);
  });

  it('uses sidebar group + child for syllabus modules', () => {
    expect(
      getModuleBreadcrumb(
        RouteService.karvita.syllabusCourseOfferings(),
        'super_admin'
      )
    ).toEqual([
      { label: 'مدیریت ترم و سرفصل' },
      { label: 'ارائه و سرفصل دروس' },
    ]);
    expect(
      getModuleBreadcrumb(
        RouteService.karvita.syllabusTermSettings(),
        'super_admin'
      )
    ).toEqual([
      { label: 'مدیریت ترم و سرفصل' },
      { label: 'تنظیمات عمومی ترم‌ها' },
    ]);
  });

  it('uses sidebar group + child for organization modules', () => {
    expect(
      getModuleBreadcrumb(
        RouteService.karvita.organizationalStructure(),
        'super_admin'
      )
    ).toEqual([
      { label: 'مدیریت سازمانی' },
      { label: 'ساختار سازمانی' },
    ]);
  });

  it('prefixes flat modules with home', () => {
    expect(
      getModuleBreadcrumb(
        RouteService.karvita.onboardingApprovals(),
        'super_admin'
      )
    ).toEqual([
      {
        label: 'میز کار مدیریت',
        href: RouteService.karvita.adminDashboard(),
      },
      { label: 'بررسی مدارک هویتی' },
    ]);
  });

  it('builds profile trail from home + profile title', () => {
    expect(
      getModuleBreadcrumb('/karvita/super_admin/profile', 'super_admin')
    ).toEqual([
      {
        label: 'میز کار مدیریت',
        href: RouteService.karvita.adminDashboard(),
      },
      { label: 'پروفایل و اسناد هویتی' },
    ]);
  });
});

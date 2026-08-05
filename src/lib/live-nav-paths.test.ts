import { describe, expect, it } from 'vitest';

import {
  isAdminControlPlanePath,
  isLiveSidebarPath,
  isNavigableAppPath,
} from '@/lib/live-nav-paths';
import { isAppShellPath, RouteService } from '@/services/route.service';
import {
  getVisibleSidebarMenu,
  isSidebarMenuGroup,
} from '@/utils/RoleStrategyMap';

describe('live nav / admin plane', () => {
  it('treats org structure as admin control plane', () => {
    expect(
      isAdminControlPlanePath(RouteService.karvita.organizationalStructure())
    ).toBe(true);
    expect(isNavigableAppPath('/karvita/organizational-structure')).toBe(
      false
    );
  });

  it('only exposes live sidebar links for student and super_admin', () => {
    const studentMenu = getVisibleSidebarMenu('student');
    expect(studentMenu.map((i) => ('path' in i ? i.path : i.title))).toEqual([
      RouteService.karvita.dashboard(),
      'انتخاب واحد کارورزی',
    ]);
    const studentGroup = studentMenu.find(isSidebarMenuGroup);
    expect(studentGroup?.children.map((c) => c.path)).toEqual([
      RouteService.karvita.internshipSelection(1),
      RouteService.karvita.internshipSelection(2),
      RouteService.karvita.internshipSelection(3),
      RouteService.karvita.internshipSelection(4),
    ]);

    const learnerMenu = getVisibleSidebarMenu('skill_learner');
    expect(learnerMenu.map((i) => ('path' in i ? i.path : i.title))).toEqual([
      RouteService.karvita.dashboard(),
      'انتخاب واحد کارآموزی',
    ]);
    const learnerGroup = learnerMenu.find(isSidebarMenuGroup);
    expect(learnerGroup?.children.map((c) => c.path)).toEqual([
      RouteService.karvita.internshipSelection(1),
      RouteService.karvita.internshipSelection(2),
    ]);

    expect(
      isLiveSidebarPath(RouteService.karvita.internshipSelection(1))
    ).toBe(true);
    expect(isLiveSidebarPath(RouteService.karvita.internshipSelection())).toBe(
      false
    );
    expect(isNavigableAppPath(RouteService.karvita.internshipSelection())).toBe(
      true
    );

    const adminMenu = getVisibleSidebarMenu('super_admin');
    expect(adminMenu.map((entry) => entry.title)).toEqual([
      'میز کار مدیریت',
      'بررسی مدارک هویتی',
      'مدیریت محتوای لندینگ',
      'مدیریت سازمانی',
      'مدیریت ترم و سرفصل',
    ]);

    const groups = adminMenu.filter(isSidebarMenuGroup);
    expect(groups).toHaveLength(2);

    const orgGroup = groups.find((g) => g.title === 'مدیریت سازمانی');
    expect(orgGroup?.children.map((c) => c.path)).toEqual([
      RouteService.karvita.organizationalStructure(),
      RouteService.karvita.adminUserCreation(),
    ]);

    const syllabusGroup = groups.find((g) => g.title === 'مدیریت ترم و سرفصل');
    expect(syllabusGroup?.children.map((c) => c.path)).toEqual([
      RouteService.karvita.syllabusCourseOfferings(),
      RouteService.karvita.syllabusTermSettings(),
    ]);

    expect(isLiveSidebarPath(RouteService.karvita.dailyReports())).toBe(false);
    expect(isLiveSidebarPath(RouteService.karvita.entry())).toBe(false);
  });

  it('treats onboarding approvals as admin control plane', () => {
    expect(
      isAdminControlPlanePath(RouteService.karvita.onboardingApprovals())
    ).toBe(true);
    expect(isNavigableAppPath('/karvita/onboarding-approvals')).toBe(false);
  });

  it('treats syllabus modules as admin control plane', () => {
    expect(
      isAdminControlPlanePath(RouteService.karvita.syllabusCourseOfferings())
    ).toBe(true);
    expect(
      isAdminControlPlanePath(RouteService.karvita.syllabusTermSettings())
    ).toBe(true);
    expect(isNavigableAppPath('/karvita/syllabus')).toBe(false);
    expect(
      isLiveSidebarPath(RouteService.karvita.syllabusCourseOfferings())
    ).toBe(true);
    expect(
      isLiveSidebarPath(RouteService.karvita.syllabusTermSettings())
    ).toBe(true);
    expect(isLiveSidebarPath(RouteService.karvita.syllabusConfig())).toBe(
      false
    );
    expect(isNavigableAppPath(RouteService.karvita.syllabusConfig())).toBe(
      true
    );
  });

  it('treats admin user creation as admin control plane', () => {
    expect(
      isAdminControlPlanePath(RouteService.karvita.adminUserCreation())
    ).toBe(true);
    expect(
      isLiveSidebarPath(RouteService.karvita.adminUserCreation())
    ).toBe(true);
  });

  it('treats landing CMS as admin control plane and live sidebar path', () => {
    expect(isAdminControlPlanePath(RouteService.karvita.landingCms())).toBe(
      true
    );
    expect(isLiveSidebarPath(RouteService.karvita.landingCms())).toBe(true);
    expect(isNavigableAppPath('/karvita/landing-cms')).toBe(false);
    expect(RouteService.karvita.landingCms()).toBe(
      '/karvita/admin/landing-cms'
    );
  });

  it('exposes live marketing paths without inventing sidebar links', () => {
    expect(RouteService.marketing.home()).toBe('/');
    expect(RouteService.marketing.loginSelect()).toBe('/login-select');
    expect(isNavigableAppPath(RouteService.marketing.home())).toBe(true);
    expect(isNavigableAppPath(RouteService.marketing.loginSelect())).toBe(true);
    expect(isNavigableAppPath('/about')).toBe(false);
    expect(isNavigableAppPath('/benefits')).toBe(false);
    expect(isLiveSidebarPath(RouteService.marketing.loginSelect())).toBe(false);
  });

  it('scopes app shell (theme/connectivity) to dashboards, not marketing/auth', () => {
    expect(isAppShellPath(RouteService.karvita.dashboard())).toBe(true);
    expect(isAppShellPath(RouteService.karvita.landingCms())).toBe(true);
    expect(isAppShellPath(RouteService.marketing.home())).toBe(false);
    expect(isAppShellPath(RouteService.marketing.loginSelect())).toBe(false);
    expect(isAppShellPath(RouteService.auth.login())).toBe(false);
  });
});


import { describe, expect, it } from 'vitest';

import {
  isAdminControlPlanePath,
  isLiveSidebarPath,
  isLiveStaticNavPath,
  isNavigableAppPath,
} from '@/lib/live-nav-paths';
import { isAppShellPath, RouteService } from '@/services/route.service';
import { PlannedRoutes } from '@/services/planned-routes';
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

  it('only exposes implemented links in each role sidebar', () => {
    const studentMenu = getVisibleSidebarMenu('student');
    expect(studentMenu.map((i) => ('path' in i ? i.path : i.title))).toEqual([
      RouteService.karvita.dashboard(),
      'انتخاب واحد کارورزی',
    ]);
    const studentGroup = studentMenu.find(isSidebarMenuGroup);
    expect(studentGroup?.defaultOpen).toBe(true);
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
    expect(learnerGroup?.defaultOpen).toBe(true);
    expect(learnerGroup?.children.map((c) => c.path)).toEqual([
      RouteService.karvita.internshipSelection(1),
      RouteService.karvita.internshipSelection(2),
    ]);

    const supervisorMenu = getVisibleSidebarMenu('supervisor_professor');
    expect(
      supervisorMenu.map((entry) => ('path' in entry ? entry.path : entry.title))
    ).toEqual([
      RouteService.karvita.dashboard(),
      RouteService.karvita.dailyApprovals(),
      RouteService.karvita.organizationalCapacities(),
    ]);

    const mentorMenu = getVisibleSidebarMenu('mentor_teacher');
    expect(
      mentorMenu.map((entry) => ('path' in entry ? entry.path : entry.title))
    ).toEqual([
      RouteService.karvita.dashboard(),
      RouteService.karvita.dailyApprovals(),
    ]);

    const principalMenu = getVisibleSidebarMenu('school_principal');
    expect(
      principalMenu.map((entry) => ('path' in entry ? entry.path : entry.title))
    ).toEqual([
      RouteService.karvita.dashboard(),
      RouteService.karvita.dailyApprovals(),
    ]);

    for (const role of [
      'faculty_role',
      'regional_edu_admin',
      'provincial_university',
      'central_organization',
    ] as const) {
      expect(
        getVisibleSidebarMenu(role).map((entry) =>
          'path' in entry ? entry.path : entry.title
        )
      ).toEqual([RouteService.karvita.dashboard()]);
    }

    expect(
      isLiveSidebarPath(RouteService.karvita.internshipSelection(1))
    ).toBe(true);
    expect(isLiveSidebarPath(RouteService.karvita.dailyApprovals())).toBe(true);
    expect(
      isLiveSidebarPath(RouteService.karvita.organizationalCapacities())
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
    expect(groups.every((g) => g.defaultOpen)).toBe(true);

    const orgGroup = groups.find((g) => g.title === 'مدیریت سازمانی');
    expect(orgGroup?.children.map((c) => c.path)).toEqual([
      RouteService.karvita.organizationalStructure(),
      RouteService.karvita.adminUserCreation(),
    ]);

    const assistantMenu = getVisibleSidebarMenu('assistant_admin');
    expect(assistantMenu.map((entry) => entry.title)).toEqual([
      'میز کار مدیریت',
      'بررسی مدارک هویتی',
      'مدیریت محتوای لندینگ',
      'مدیریت سازمانی',
      'مدیریت ترم و سرفصل',
    ]);
    expect(
      assistantMenu
        .filter(isSidebarMenuGroup)
        .find((g) => g.title === 'مدیریت سازمانی')
        ?.children.map((c) => c.path)
    ).toEqual([RouteService.karvita.organizationalStructure()]);
    expect(
      assistantMenu
        .filter(isSidebarMenuGroup)
        .find((g) => g.title === 'مدیریت ترم و سرفصل')
        ?.children.map((c) => c.path)
    ).toEqual([RouteService.karvita.syllabusCourseOfferings()]);

    const syllabusGroup = groups.find((g) => g.title === 'مدیریت ترم و سرفصل');
    expect(syllabusGroup?.children.map((c) => c.path)).toEqual([
      RouteService.karvita.syllabusCourseOfferings(),
      RouteService.karvita.syllabusTermSettings(),
    ]);

    expect(isLiveSidebarPath(RouteService.karvita.dashboard())).toBe(true);
    expect(isLiveSidebarPath(RouteService.karvita.adminDashboard())).toBe(true);
    expect(isLiveSidebarPath(PlannedRoutes.dailyReports())).toBe(false);
    expect(isLiveSidebarPath('/karvita/entry')).toBe(false);
    expect(isNavigableAppPath('/karvita/entry')).toBe(false);
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

  it('treats admin user creation as admin control plane and shows it in the sidebar', () => {
    expect(
      isAdminControlPlanePath(RouteService.karvita.adminUserCreation())
    ).toBe(true);
    expect(isLiveStaticNavPath(RouteService.karvita.adminUserCreation())).toBe(
      true
    );
    expect(isLiveSidebarPath(RouteService.karvita.adminUserCreation())).toBe(
      true
    );
  });

  it('treats landing CMS as an active admin control plane and keeps it on the sidebar', () => {
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
    expect(RouteService.marketing.cmsPagesBase()).toBe('/p');
    expect(RouteService.marketing.cmsPage('about')).toBe('/p/about');
    expect(isNavigableAppPath(RouteService.marketing.home())).toBe(true);
    expect(isNavigableAppPath(RouteService.marketing.loginSelect())).toBe(true);
    expect(isNavigableAppPath('/about')).toBe(false);
    expect(isNavigableAppPath('/benefits')).toBe(false);
    expect(isLiveSidebarPath(RouteService.marketing.loginSelect())).toBe(false);
    expect(RouteService.marketing.isMarketingCmsPath('/p/x')).toBe(true);
    expect(RouteService.marketing.isMarketingCmsPath('/about')).toBe(false);
  });

  it('scopes app shell (connectivity chrome) to dashboards, not marketing/auth', () => {
    expect(isAppShellPath(RouteService.karvita.dashboard())).toBe(true);
    expect(isAppShellPath(RouteService.karvita.landingCms())).toBe(true);
    expect(isAppShellPath(RouteService.marketing.home())).toBe(false);
    expect(isAppShellPath(RouteService.marketing.loginSelect())).toBe(false);
    expect(isAppShellPath(RouteService.marketing.offline())).toBe(false);
    expect(isAppShellPath(RouteService.auth.login())).toBe(false);
    expect(isNavigableAppPath(RouteService.auth.forgot())).toBe(true);
    expect(isLiveSidebarPath(RouteService.auth.forgot())).toBe(false);
  });
});


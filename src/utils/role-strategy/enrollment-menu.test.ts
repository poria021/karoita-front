import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useSidebarMenu } from '@/components/shared/shell/useSidebarMenu';
import * as activeCourseDefinitionsModule from '@/hooks/useActiveCourseDefinitions';
import * as apiMode from '@/lib/api-mode';
import { RouteService } from '@/services/route.service';
import { cloneDefaultCourseDefinitions } from '@/services/syllabus-config/course-catalog';
import type { CourseDefinition } from '@/types/syllabus-config';

import { withEnrollmentSubModules } from './enrollment-menu';
import { ROLE_STRATEGY_MAP } from './strategies';
import { isSidebarMenuGroup, type SidebarMenuEntry } from './types';

vi.mock('@/components/shared/shell/useEnrollmentLeafAvailability', () => ({
  useEnrollmentLeafAvailability: () => ({
    offeredLevels: null,
    enrolledLevels: undefined,
  }),
}));

const STUDENT_MENU = ROLE_STRATEGY_MAP.student.sidebarMenu;

const PROJECT: CourseDefinition = {
  id: 'crs_project',
  title: 'پروژه',
  audience: 'semester',
  isActive: true,
  subModules: [
    { id: 'crs_project_m_1', title: 'پروژه الف', level: 101 },
    { id: 'crs_project_m_2', title: 'پروژه ب', level: 102 },
  ],
};

const WORKSHOP: CourseDefinition = {
  id: 'crs_workshop',
  title: 'کارگاه',
  audience: 'semester',
  isActive: true,
  subModules: [],
  level: 103,
};

function titles(menu: SidebarMenuEntry[]) {
  return menu.map((entry) => entry.title);
}

describe('withEnrollmentSubModules', () => {
  it('keeps the static menu when there are no definitions (real mode)', () => {
    expect(withEnrollmentSubModules(STUDENT_MENU, [])).toBe(STUDENT_MENU);
  });

  it('turns the seeded internship course into the same group with legacy level links', () => {
    const [internship] = cloneDefaultCourseDefinitions();
    const menu = withEnrollmentSubModules(STUDENT_MENU, [internship!]);
    const group = menu.find(isSidebarMenuGroup)!;
    expect(group.title).toBe('انتخاب واحد کارورزی');
    expect(group.children.map((c) => c.path)).toEqual([
      RouteService.karvita.internshipSelection(1),
      RouteService.karvita.internshipSelection(2),
      RouteService.karvita.internshipSelection(3),
      RouteService.karvita.internshipSelection(4),
    ]);
    expect(group.children.map((c) => c.iconBadge)).toEqual([1, 2, 3, 4]);
  });

  it('makes one title per course: a group with sub-modules, or a single item without', () => {
    const [internship] = cloneDefaultCourseDefinitions();
    const menu = withEnrollmentSubModules(STUDENT_MENU, [
      internship!,
      PROJECT,
      WORKSHOP,
    ]);
    expect(titles(menu)).toEqual([
      'میز کار',
      'اطلاعیه‌ها و اعلان‌ها',
      'انتخاب واحد کارورزی',
      'انتخاب واحد پروژه',
      'انتخاب واحد کارگاه',
      'گزارش روزانه',
    ]);

    const project = menu.find((e) => e.title === 'انتخاب واحد پروژه')!;
    if (!isSidebarMenuGroup(project)) throw new Error('expected group');
    expect(project.children.map((c) => [c.title, c.path])).toEqual([
      ['پروژه الف', '/karvita/internships/101'],
      ['پروژه ب', '/karvita/internships/102'],
    ]);

    const workshop = menu.find((e) => e.title === 'انتخاب واحد کارگاه')!;
    expect(isSidebarMenuGroup(workshop)).toBe(false);
    expect((workshop as { path: string }).path).toBe(
      '/karvita/internships/103'
    );
  });

  it('keeps defined-but-inactive courses visible and marks them disabled', () => {
    const inactiveProject: CourseDefinition = {
      ...PROJECT,
      id: 'crs_inactive_project',
      isActive: false,
    };

    const menu = withEnrollmentSubModules(STUDENT_MENU, [inactiveProject]);
    const project = menu.find((entry) => entry.title === 'انتخاب واحد پروژه');
    expect(project).toBeTruthy();
    if (!project) return;

    if (!isSidebarMenuGroup(project)) {
      expect(project).toMatchObject({
        title: 'انتخاب واحد پروژه',
        disabled: true,
      });
      return;
    }

    expect(project.children.every((child) => child.disabled === true)).toBe(true);
  });

  function projectChildren(menu: SidebarMenuEntry[]) {
    const project = menu.find((entry) => entry.title === 'انتخاب واحد پروژه');
    if (!project || !isSidebarMenuGroup(project)) {
      throw new Error('expected the project group');
    }
    return project.children;
  }

  it('disables only the inactive submodule while keeping an active sibling enabled', () => {
    const mixed: CourseDefinition = {
      ...PROJECT,
      subModules: [
        { id: 'crs_project_m_1', title: 'پروژه الف', level: 101, isActive: true },
        { id: 'crs_project_m_2', title: 'پروژه ب', level: 102, isActive: false },
      ],
    };
    const menu = withEnrollmentSubModules(STUDENT_MENU, [mixed], {
      offeredLevels: new Set([101, 102]),
    });
    expect(projectChildren(menu).map((c) => [c.title, c.disabled])).toEqual([
      ['پروژه الف', false],
      ['پروژه ب', true],
    ]);
  });

  it('keeps an inactive submodule enabled when the learner took it before', () => {
    const mixed: CourseDefinition = {
      ...PROJECT,
      isActive: false,
      subModules: [
        {
          id: 'crs_project_m_1',
          title: 'پروژه الف',
          level: 101,
          isActive: false,
        },
        {
          id: 'crs_project_m_2',
          title: 'پروژه ب',
          level: 102,
          isActive: false,
        },
      ],
    };
    const menu = withEnrollmentSubModules(STUDENT_MENU, [mixed], {
      enrolledLevels: new Set([102]),
    });
    expect(projectChildren(menu).map((c) => c.disabled)).toEqual([true, false]);
  });

  it('disables a leaf that is not offered in the current term', () => {
    const menu = withEnrollmentSubModules(STUDENT_MENU, [PROJECT], {
      offeredLevels: new Set([101]),
    });
    expect(projectChildren(menu).map((c) => [c.title, c.disabled])).toEqual([
      ['پروژه الف', false],
      ['پروژه ب', true],
    ]);
  });

  it('keeps a not-offered leaf enabled when the learner took it before', () => {
    const menu = withEnrollmentSubModules(STUDENT_MENU, [PROJECT], {
      offeredLevels: new Set<number>(),
      enrolledLevels: new Set([102]),
    });
    expect(projectChildren(menu).map((c) => c.disabled)).toEqual([true, false]);
  });

  it('keeps an inactive course enabled only for the leaves taken before', () => {
    const menu = withEnrollmentSubModules(
      STUDENT_MENU,
      [{ ...PROJECT, isActive: false }],
      { enrolledLevels: new Set([101]) }
    );
    expect(projectChildren(menu).map((c) => c.disabled)).toEqual([false, true]);
  });

  it('only checks the catalog flag while the offering is still unknown', () => {
    const menu = withEnrollmentSubModules(STUDENT_MENU, [PROJECT], {
      offeredLevels: null,
    });
    expect(projectChildren(menu).every((c) => c.disabled === false)).toBe(true);
  });

  it('applies the same rule to a course without sub-modules', () => {
    const find = (menu: SidebarMenuEntry[]) =>
      menu.find((entry) => entry.title === 'انتخاب واحد کارگاه');

    const notOffered = withEnrollmentSubModules(STUDENT_MENU, [WORKSHOP], {
      offeredLevels: new Set<number>(),
    });
    expect(find(notOffered)).toMatchObject({ disabled: true });

    const taken = withEnrollmentSubModules(STUDENT_MENU, [WORKSHOP], {
      offeredLevels: new Set<number>(),
      enrolledLevels: new Set([103]),
    });
    expect(find(taken)).toMatchObject({ disabled: false });
  });
});

describe('withEnrollmentSubModules whenEmpty', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('removes the enrollment group when real lessons are genuinely empty', () => {
    const result = withEnrollmentSubModules(STUDENT_MENU, [], { whenEmpty: 'remove' });
    expect(titles(result)).not.toContain('انتخاب واحد کارورزی');
    expect(result.length).toBe(STUDENT_MENU.length - 1);
  });

  function renderStudentMenu() {
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        QueryClientProvider,
        {
          client: new QueryClient({
            defaultOptions: { queries: { retry: false } },
          }),
        },
        children
      );
    return renderHook(() => useSidebarMenu('student'), { wrapper });
  }

  it('hides the static student enrollment seed when real catalog is ready but empty', () => {
    vi.spyOn(apiMode, 'isMockApiMode').mockReturnValue(false);
    vi.spyOn(activeCourseDefinitionsModule, 'useActiveCourseDefinitions').mockReturnValue({
      status: 'ready',
      semester: [],
      modular: [],
    });

    const { result } = renderStudentMenu();

    expect(result.current.find((entry) => entry.title === 'انتخاب واحد کارورزی')).toBeFalsy();
  });

  it('keeps the static student enrollment seed when the real catalog request fails', () => {
    vi.spyOn(apiMode, 'isMockApiMode').mockReturnValue(false);
    vi.spyOn(activeCourseDefinitionsModule, 'useActiveCourseDefinitions').mockReturnValue({
      status: 'error',
      semester: [],
      modular: [],
    });

    const { result } = renderStudentMenu();

    expect(result.current.find((entry) => entry.title === 'انتخاب واحد کارورزی')).toBeTruthy();
  });
});

describe('useSidebarMenu review roles', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderReviewMenu(
    role: 'supervisor_professor' | 'mentor_teacher' | 'school_principal'
  ) {
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        QueryClientProvider,
        {
          client: new QueryClient({
            defaultOptions: { queries: { retry: false } },
          }),
        },
        children
      );
    return renderHook(() => useSidebarMenu(role), { wrapper });
  }

  it('keeps the flat ارزیابی link when real catalog is ready but empty', () => {
    vi.spyOn(apiMode, 'isMockApiMode').mockReturnValue(false);
    vi.spyOn(
      activeCourseDefinitionsModule,
      'useActiveCourseDefinitions'
    ).mockReturnValue({
      status: 'ready',
      semester: [],
      modular: [],
    });

    const { result } = renderReviewMenu('supervisor_professor');
    const entry = result.current.find(
      (item) => item.title === 'ارزیابی گزارش‌های فراگیران'
    );

    expect(entry).toBeTruthy();
    expect(isSidebarMenuGroup(entry!)).toBe(false);
  });

  it('falls back to default کارورزی/کارآموزی when the real catalog request fails', () => {
    vi.spyOn(apiMode, 'isMockApiMode').mockReturnValue(false);
    vi.spyOn(
      activeCourseDefinitionsModule,
      'useActiveCourseDefinitions'
    ).mockReturnValue({
      status: 'error',
      semester: [],
      modular: [],
    });

    const { result } = renderReviewMenu('mentor_teacher');
    const entry = result.current.find(
      (item) => item.title === 'ارزیابی گزارش‌های فراگیران'
    );

    expect(isSidebarMenuGroup(entry!)).toBe(true);
    if (!isSidebarMenuGroup(entry!)) return;
    expect(entry.children.map((child) => child.title)).toEqual([
      'کارورزی',
      'کارآموزی',
    ]);
  });
});

import { describe, expect, it } from 'vitest';

import { RouteService } from '@/services/route.service';
import { cloneDefaultCourseDefinitions } from '@/services/syllabus-config/course-catalog';
import type { CourseDefinition } from '@/types/syllabus-config';

import { withEnrollmentSubModules } from './enrollment-menu';
import { ROLE_STRATEGY_MAP } from './strategies';
import { isSidebarMenuGroup, type SidebarMenuEntry } from './types';

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
});

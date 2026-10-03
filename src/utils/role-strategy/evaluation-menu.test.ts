import { describe, expect, it } from 'vitest';

import { RouteService } from '@/services/route.service';
import type { CourseDefinition } from '@/types/syllabus-config';

import { withEvaluationSubModules } from './evaluation-menu';
import { isSidebarMenuGroup, type SidebarMenuEntry } from './types';

const MENU: SidebarMenuEntry[] = [
  { title: 'میز کار', path: RouteService.karvita.dashboard(), icon: 'fa-home' },
  {
    title: 'ارزیابی گزارش‌های فراگیران',
    path: RouteService.karvita.dailyApprovals(),
    icon: 'fa-clipboard-check',
  },
];

function course(
  id: string,
  title: string,
  audience: CourseDefinition['audience'],
  subCount = 0
): CourseDefinition {
  return {
    id,
    title,
    audience,
    isActive: true,
    subModules: Array.from({ length: subCount }, (_, i) => ({
      id: `${id}_${i}`,
      title: `${title} ${i + 1}`,
    })),
  };
}

function evaluationGroup(menu: SidebarMenuEntry[]) {
  const entry = menu[1]!;
  if (!isSidebarMenuGroup(entry)) throw new Error('expected group');
  return entry;
}

describe('withEvaluationSubModules', () => {
  it('falls back to the two default links when there are no definitions', () => {
    const group = evaluationGroup(
      withEvaluationSubModules(MENU, { semester: [], modular: [] })
    );
    expect(group.children.map((c) => c.path)).toEqual([
      '/karvita/daily-approvals?kind=internship',
      '/karvita/daily-approvals?kind=apprenticeship',
    ]);
  });

  it('uses each course (not its sub-modules) as a sub-title of the module', () => {
    const group = evaluationGroup(
      withEvaluationSubModules(MENU, {
        semester: [
          course('course_internship', 'کارورزی', 'semester', 4),
          course('crs_1', 'کارگاه', 'semester'),
        ],
        modular: [course('course_apprenticeship', 'کارآموزی', 'modular', 2)],
      })
    );
    expect(group.title).toBe('ارزیابی گزارش‌های فراگیران');
    expect(group.children.map((c) => [c.title, c.path])).toEqual([
      [
        'کارورزی',
        '/karvita/daily-approvals?kind=internship&module=course_internship',
      ],
      ['کارگاه', '/karvita/daily-approvals?kind=internship&module=crs_1'],
      [
        'کارآموزی',
        '/karvita/daily-approvals?kind=apprenticeship&module=course_apprenticeship',
      ],
    ]);
  });

  it('leaves other entries untouched', () => {
    const next = withEvaluationSubModules(MENU, { semester: [], modular: [] });
    expect(next[0]).toBe(MENU[0]);
  });

  it('adds the panel label only when the same title exists in both panels', () => {
    const group = evaluationGroup(
      withEvaluationSubModules(MENU, {
        semester: [
          course('a', 'کارگاه', 'semester'),
          course('b', 'کارورزی', 'semester'),
        ],
        modular: [course('c', 'کارگاه', 'modular')],
      })
    );
    expect(group.children.map((child) => child.title)).toEqual([
      'کارگاه (ترمی)',
      'کارورزی',
      'کارگاه (پودمانی)',
    ]);
  });
});

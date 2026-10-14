import { describe, expect, it } from 'vitest';

import type { CourseDefinition } from '@/types/syllabus-config';

import { filterTermCoursesByModule } from './filterTermCoursesByModule';

const term = [
  { id: 'l1', title: 'کارورزی ۱', courseFilter: 'l1' },
  { id: 'l2', title: 'کارورزی 2', courseFilter: 'l2' },
  { id: 'l3', title: 'پروژه', courseFilter: 'l3' },
];

function course(partial: Partial<CourseDefinition>): CourseDefinition {
  return {
    id: 'c',
    title: 'کارورزی',
    audience: 'semester',
    isActive: true,
    subModules: [],
    ...partial,
  };
}

describe('filterTermCoursesByModule', () => {
  it('keeps term lessons whose title matches a sub-module, ignoring digit style', () => {
    const result = filterTermCoursesByModule(
      term,
      course({
        subModules: [
          { id: 's1', title: 'کارورزی 1' },
          { id: 's2', title: 'کارورزی ۲' },
        ],
      })
    );
    expect(result.map((row) => row.id)).toEqual(['l1', 'l2']);
  });

  it('matches a standalone course by its own title', () => {
    const result = filterTermCoursesByModule(term, course({ title: ' پروژه ' }));
    expect(result.map((row) => row.id)).toEqual(['l3']);
  });

  it('falls back to every term lesson when nothing matches or no module is selected', () => {
    expect(filterTermCoursesByModule(term, course({ title: 'کارگاه' }))).toBe(term);
    expect(filterTermCoursesByModule(term, null)).toBe(term);
  });
});

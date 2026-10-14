import { describe, expect, it } from 'vitest';

import { buildEnrollableCourse } from './useEnrollableLessonCourses';

describe('buildEnrollableCourse', () => {
  it('keeps one lesson per level of the given kind, sorted by level', () => {
    const course = buildEnrollableCourse('internship', [
      { id: 'b', title: 'کارورزی ۳' },
      { id: 'a', title: 'کارورزی ۱' },
      { id: 'dup', title: 'کارورزی 1' },
      { id: 'x', title: 'کارآموزی ۱' },
      { id: 'y', title: 'بدون سطح' },
    ]);

    expect(course?.title).toBe('کارورزی');
    expect(course?.subModules).toEqual([
      { id: 'a', title: 'کارورزی ۱', level: 1 },
      { id: 'b', title: 'کارورزی ۳', level: 3 },
    ]);
  });

  it('returns null when no lesson of that kind exists', () => {
    expect(buildEnrollableCourse('apprenticeship', [{ id: 'a', title: 'کارورزی ۱' }])).toBeNull();
  });
});

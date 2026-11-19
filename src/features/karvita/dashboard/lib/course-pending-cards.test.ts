import { describe, expect, it } from 'vitest';

import { mergePendingWithCourses } from './course-pending-cards';

describe('mergePendingWithCourses', () => {
  it('adds courses without pending reports with a zero count', () => {
    const merged = mergePendingWithCourses(
      [{ title: 'کارورزی ۱', pendingCount: 1 }],
      ['کارورزی ۱', 'کارورزی ۲', 'کارآموزی ۱']
    );
    expect(merged).toEqual([
      { title: 'کارورزی ۱', pendingCount: 1 },
      { title: 'کارورزی ۲', pendingCount: 0 },
      { title: 'کارآموزی ۱', pendingCount: 0 },
    ]);
  });

  it('keeps pending cards whose course is missing from the course list', () => {
    const merged = mergePendingWithCourses(
      [{ title: 'درس ناشناخته', pendingCount: 3 }],
      ['کارورزی ۱']
    );
    expect(merged).toEqual([
      { title: 'کارورزی ۱', pendingCount: 0 },
      { title: 'درس ناشناخته', pendingCount: 3 },
    ]);
  });

  it('falls back to the pending cards alone when the course list is empty', () => {
    expect(
      mergePendingWithCourses([{ title: 'کارورزی ۱', pendingCount: 2 }], [])
    ).toEqual([{ title: 'کارورزی ۱', pendingCount: 2 }]);
  });

  it('does not duplicate repeated titles', () => {
    expect(mergePendingWithCourses([], ['کارورزی ۱', ' کارورزی ۱ '])).toEqual([
      { title: 'کارورزی ۱', pendingCount: 0 },
    ]);
  });
});

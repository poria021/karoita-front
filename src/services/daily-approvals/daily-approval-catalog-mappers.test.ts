import { describe, expect, it } from 'vitest';

import {
  toDailyApprovalCatalogCourses,
  toDailyApprovalCourseFilter,
  toDailyApprovalWeekOptions,
} from './daily-approval-catalog-mappers';

describe('daily approval catalog mappers', () => {
  it('maps internship and apprenticeship titles onto course filters', () => {
    expect(toDailyApprovalCourseFilter('internship', 'کارورزی ۳')).toBe(
      'intern3'
    );
    expect(toDailyApprovalCourseFilter('apprenticeship', 'کارآموزی ۲')).toBe(
      'appr2'
    );
  });

  it('keeps lesson ids and titles for the picker', () => {
    expect(
      toDailyApprovalCatalogCourses('internship', [
        { id: 'l1', title: 'کارورزی ۱' },
      ])
    ).toEqual([
      { id: 'l1', title: 'کارورزی ۱', courseFilter: 'intern1' },
    ]);
  });

  it('numbers weeks in list order and persianizes labels', () => {
    expect(
      toDailyApprovalWeekOptions([{ title: 'هفته 1' }, { title: '' }])
    ).toEqual([
      { value: '1', label: 'هفته ۱', weekNumber: 1 },
      { value: '2', label: 'هفته ۲', weekNumber: 2 },
    ]);
  });
});

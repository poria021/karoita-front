import { describe, expect, it } from 'vitest';

import {
  buildLearnerCourseWeekRows,
  buildLearnerGradeSeries,
} from './learner-workbench';
import { FAKE_LEARNER_SNAPSHOTS } from './learner-workbench-preview';

describe('learner workbench fake preview data', () => {
  it('feeds the course-weeks box: 5 rows, mixed lengths, grades and statuses', () => {
    const rows = buildLearnerCourseWeekRows(FAKE_LEARNER_SNAPSHOTS);

    expect(rows).toHaveLength(5);
    expect(rows.map((row) => row.weeks.length).sort((a, b) => a - b)).toEqual([
      8, 16, 16, 16, 16,
    ]);
    expect(rows.some((row) => row.finalGrade == null)).toBe(true);
    expect(rows.some((row) => row.finalGrade != null)).toBe(true);

    const statuses = new Set(
      rows.flatMap((row) => row.weeks.map((week) => week.status))
    );
    for (const status of [
      'graded',
      'pending',
      'needs_edit',
      'approved',
      'draft',
      'overdue',
      'extended',
      'locked_future',
    ] as const) {
      expect(statuses.has(status)).toBe(true);
    }
  });

  it('feeds the weekly grades chart with open-term courses only', () => {
    const series = buildLearnerGradeSeries(FAKE_LEARNER_SNAPSHOTS);

    // کارورزی ۱ مال ترم قبل است و روی نمودار نمی‌آید؛ بقیه می‌آیند.
    expect(series.map((item) => item.id)).toEqual([
      'apprenticeship-1',
      'internship-2',
      'internship-3',
      'internship-4',
    ]);
    expect(
      series.some((item) => item.weeks.some((week) => week.score != null))
    ).toBe(true);
  });
});

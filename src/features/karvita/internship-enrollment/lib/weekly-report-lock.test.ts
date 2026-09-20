import { describe, expect, it } from 'vitest';

import type { InternshipWeeklySession } from '@/types/internship-enrollment';

import {
  getWeeklyReportLockNotice,
  isWeeklyReportEditable,
  isWeeklyReportLocked,
} from './weekly-report-lock';

function week(
  partial: Partial<InternshipWeeklySession> &
    Pick<InternshipWeeklySession, 'id' | 'status'>
): InternshipWeeklySession {
  return {
    title: partial.title ?? `هفته ${partial.id}`,
    score: partial.score ?? null,
    text: partial.text,
    files: partial.files,
    feedback: partial.feedback,
    isExtended: partial.isExtended,
    ...partial,
  };
}

describe('weekly-report-lock', () => {
  const weeks = [
    week({ id: '1', status: 'graded' }),
    week({ id: '2', status: 'draft' }),
    week({ id: '3', status: 'locked_future' }),
  ];

  it('locks archived/completed/dropped enrollments', () => {
    expect(
      isWeeklyReportLocked({
        week: weeks[1]!,
        weeks,
        enrollmentStatus: 'completed',
        removalPending: false,
        isTermArchived: false,
      })
    ).toBe(true);

    expect(
      isWeeklyReportLocked({
        week: weeks[1]!,
        weeks,
        enrollmentStatus: 'active',
        removalPending: true,
        isTermArchived: false,
      })
    ).toBe(true);
  });

  it('keeps draft/needs_edit/extended editable when term is active', () => {
    expect(
      isWeeklyReportEditable({
        week: week({ id: '2', status: 'draft' }),
        weeks,
        enrollmentStatus: 'active',
        removalPending: false,
        isTermArchived: false,
      })
    ).toBe(true);

    expect(
      isWeeklyReportEditable({
        week: week({ id: '4', status: 'pending' }),
        weeks,
        enrollmentStatus: 'active',
        removalPending: false,
        isTermArchived: false,
      })
    ).toBe(false);
  });

  it('builds lock notices for future/overdue/pending', () => {
    const future = getWeeklyReportLockNotice({
      week: week({ id: '3', status: 'locked_future' }),
      weeks,
      enrollmentStatus: 'active',
      removalPending: false,
      isTermArchived: false,
    });
    expect(future.title).toContain('باز نشده');

    const overdue = getWeeklyReportLockNotice({
      week: week({ id: '5', status: 'overdue' }),
      weeks,
      enrollmentStatus: 'active',
      removalPending: false,
      isTermArchived: false,
    });
    expect(overdue.variant).toBe('error');

    const pending = getWeeklyReportLockNotice({
      week: week({ id: '6', status: 'pending' }),
      weeks,
      enrollmentStatus: 'active',
      removalPending: false,
      isTermArchived: false,
    });
    expect(pending.variant).toBe('warning');
  });
});

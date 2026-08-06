import { afterEach, describe, expect, it } from 'vitest';

import {
  listMockDailyApprovals,
  resetMockDailyApprovalsForTests,
  updateMockDailyApprovalWeek,
} from './mock-daily-approvals-store';

afterEach(() => {
  resetMockDailyApprovalsForTests();
});

const baseInput = {
  query: '',
  readFilter: 'all' as const,
  course: 'all' as const,
  termId: 'term-1404-2',
  kind: 'internship' as const,
};

describe('mock daily approvals paging', () => {
  it('returns stable offset/limit pages and read filters', () => {
    const first = listMockDailyApprovals({
      ...baseInput,
      offset: 0,
      limit: 5,
    });
    const second = listMockDailyApprovals({
      ...baseInput,
      offset: 5,
      limit: 5,
    });

    expect(first.total).toBeGreaterThan(5);
    expect(first.items).toHaveLength(5);
    expect(first.hasMore).toBe(true);
    expect(second.items.length).toBeGreaterThan(0);
    expect(second.items[0]?.id).not.toBe(first.items[0]?.id);

    const unread = listMockDailyApprovals({
      ...baseInput,
      readFilter: 'unread',
      offset: 0,
      limit: 20,
    });
    expect(unread.items.length).toBeGreaterThan(0);
    expect(unread.items.every((item) => item.unreadCount > 0)).toBe(true);
  });

  it('normalizes Persian digits when searching identifiers', () => {
    const sample = listMockDailyApprovals({
      ...baseInput,
      kind: 'apprenticeship',
      offset: 0,
      limit: 1,
    }).items[0];
    expect(sample).toBeDefined();
    if (!sample) return;

    const persianQuery = sample.identifier.replace(/\d/g, (digit) =>
      '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]!
    );

    const page = listMockDailyApprovals({
      ...baseInput,
      kind: 'apprenticeship',
      query: persianQuery,
      offset: 0,
      limit: 10,
    });

    expect(page.items.length).toBeGreaterThanOrEqual(1);
    expect(page.items.some((item) => item.identifier === sample.identifier)).toBe(
      true
    );
  });

  it('persists an advisor evaluation on a week in the mock snapshot', () => {
    const trainee = listMockDailyApprovals({
      ...baseInput,
      offset: 0,
      limit: 20,
    }).items.find((row) =>
      row.weeks.some(
        (week) =>
          week.status === 'pending' ||
          week.status === 'approved' ||
          week.status === 'needs_edit'
      )
    );

    expect(trainee).toBeDefined();
    if (!trainee) return;

    const week =
      trainee.weeks.find((item) => item.status === 'pending') ??
      trainee.weeks.find((item) => item.status === 'approved') ??
      trainee.weeks.find((item) => item.status === 'needs_edit');
    expect(week).toBeDefined();
    if (!week) return;

    const updated = updateMockDailyApprovalWeek({
      traineeId: trainee.id,
      weekId: week.id,
      advisorFeedback: 'ارزیابی علمی تکمیل شد.',
      score: 87.5,
    });

    const nextWeek = updated.weeks.find((item) => item.id === week.id);
    expect(nextWeek?.status).toBe('graded');
    expect(nextWeek?.score).toBe(87.5);
    expect(nextWeek?.feedback.advisor).toBe('ارزیابی علمی تکمیل شد.');
  });
});

import { afterEach, describe, expect, it } from 'vitest';

import {
  bulkExtendMockDailyApprovalWeeks,
  listMockDailyApprovals,
  listTermsForDailyApprovalKind,
  resetMockDailyApprovalsForTests,
  updateMockDailyApprovalWeek,
  updateMockMentorDailyApprovalWeek,
  updateMockPrincipalDailyApprovalWeek,
} from './mock-daily-approvals-store';

afterEach(() => {
  resetMockDailyApprovalsForTests();
});

describe('mock daily approvals paging', () => {
  it('lists semester terms for internship and modular for apprenticeship', () => {
    const semesterTerms = listTermsForDailyApprovalKind('internship');
    const modularTerms = listTermsForDailyApprovalKind('apprenticeship');

    expect(semesterTerms.length).toBeGreaterThan(0);
    expect(modularTerms.length).toBeGreaterThan(0);
    expect(semesterTerms.some((term) => term.id.startsWith('term_modular'))).toBe(
      false
    );
    expect(modularTerms.every((term) => term.id.includes('modular'))).toBe(true);
  });

  it('returns stable offset/limit pages and read filters', () => {
    const termId = listTermsForDailyApprovalKind('internship')[0]?.id;
    expect(termId).toBeTruthy();
    if (!termId) return;

    const baseInput = {
      query: '',
      readFilter: 'all' as const,
      course: 'all' as const,
      termId,
      kind: 'internship' as const,
    };

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
    const termId = listTermsForDailyApprovalKind('apprenticeship')[0]?.id;
    expect(termId).toBeTruthy();
    if (!termId) return;

    const sample = listMockDailyApprovals({
      query: '',
      readFilter: 'all',
      course: 'all',
      termId,
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
      query: persianQuery,
      readFilter: 'all',
      course: 'all',
      termId,
      kind: 'apprenticeship',
      offset: 0,
      limit: 10,
    });

    expect(page.items.length).toBeGreaterThanOrEqual(1);
    expect(page.items.some((item) => item.identifier === sample.identifier)).toBe(
      true
    );
  });

  it('persists an advisor evaluation on a week in the mock snapshot', () => {
    const termId = listTermsForDailyApprovalKind('internship')[0]?.id;
    expect(termId).toBeTruthy();
    if (!termId) return;

    const trainee = listMockDailyApprovals({
      query: '',
      readFilter: 'all',
      course: 'all',
      termId,
      kind: 'internship',
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

  it('persists mentor and principal evaluations with competency ratings', () => {
    const termId = listTermsForDailyApprovalKind('internship')[0]?.id;
    expect(termId).toBeTruthy();
    if (!termId) return;

    const trainee = listMockDailyApprovals({
      query: '',
      readFilter: 'all',
      course: 'all',
      termId,
      kind: 'internship',
      offset: 0,
      limit: 20,
    }).items.find((row) => row.status === 'active');

    expect(trainee).toBeDefined();
    if (!trainee) return;

    const week =
      trainee.weeks.find((item) => item.status === 'pending') ??
      trainee.weeks.find((item) => item.status === 'draft');
    expect(week).toBeDefined();
    if (!week) return;

    const mentored = updateMockMentorDailyApprovalWeek({
      traineeId: trainee.id,
      weekId: week.id,
      mentorFeedback: 'عملکرد کلاسی مطلوب بود.',
      mentorRating: '4',
    });
    const mentoredWeek = mentored.weeks.find((item) => item.id === week.id);
    expect(mentoredWeek?.status).toBe('approved');
    expect(mentoredWeek?.feedback.mentor).toBe('عملکرد کلاسی مطلوب بود.');
    expect(mentoredWeek?.feedback.mentorRating).toBe('4');

    const principaled = updateMockPrincipalDailyApprovalWeek({
      traineeId: trainee.id,
      weekId: week.id,
      principalFeedback: 'حضور منظم تأیید می‌شود.',
      principalRating: '5',
    });
    const principaledWeek = principaled.weeks.find(
      (item) => item.id === week.id
    );
    expect(principaledWeek?.feedback.principal).toBe(
      'حضور منظم تأیید می‌شود.'
    );
    expect(principaledWeek?.feedback.principalRating).toBe('5');
  });

  it('bulk-extends selected week numbers for active trainees in the group', () => {
    const termId = listTermsForDailyApprovalKind('internship')[0]?.id;
    expect(termId).toBeTruthy();
    if (!termId) return;

    const before = listMockDailyApprovals({
      query: '',
      readFilter: 'all',
      course: 'all',
      termId,
      kind: 'internship',
      offset: 0,
      limit: 50,
    });

    const result = bulkExtendMockDailyApprovalWeeks({
      kind: 'internship',
      termId,
      course: 'all',
      weekNumbers: [2, 3],
    });

    expect(result.extendedPairCount).toBeGreaterThan(0);
    expect(result.revokedPairCount).toBe(0);
    expect(result.affectedTraineeCount).toBeGreaterThan(0);

    const after = listMockDailyApprovals({
      query: '',
      readFilter: 'all',
      course: 'all',
      termId,
      kind: 'internship',
      offset: 0,
      limit: 50,
    });

    const activeBefore = before.items.filter((row) => row.status === 'active');
    expect(activeBefore.length).toBeGreaterThan(0);

    for (const trainee of after.items) {
      if (trainee.status !== 'active') continue;
      for (const weekNumber of [2, 3]) {
        const week = trainee.weeks.find((item) => item.weekNumber === weekNumber);
        if (!week || week.status === 'graded') continue;
        expect(week.status).toBe('extended');
        expect(week.isExtended).toBe(true);
      }
    }
  });

  it('revokes previously extended week numbers back to overdue', () => {
    const termId = listTermsForDailyApprovalKind('internship')[0]?.id;
    expect(termId).toBeTruthy();
    if (!termId) return;

    bulkExtendMockDailyApprovalWeeks({
      kind: 'internship',
      termId,
      course: 'all',
      weekNumbers: [2, 3],
    });

    const result = bulkExtendMockDailyApprovalWeeks({
      kind: 'internship',
      termId,
      course: 'all',
      weekNumbers: [],
      revokeWeekNumbers: [2],
    });

    expect(result.revokedPairCount).toBeGreaterThan(0);
    expect(result.extendedPairCount).toBe(0);

    const after = listMockDailyApprovals({
      query: '',
      readFilter: 'all',
      course: 'all',
      termId,
      kind: 'internship',
      offset: 0,
      limit: 50,
    });

    for (const trainee of after.items) {
      if (trainee.status !== 'active') continue;
      const week2 = trainee.weeks.find((item) => item.weekNumber === 2);
      if (!week2 || week2.status === 'graded') continue;
      expect(week2.status).toBe('overdue');
      expect(week2.isExtended).toBe(false);

      const week3 = trainee.weeks.find((item) => item.weekNumber === 3);
      if (!week3 || week3.status === 'graded') continue;
      expect(week3.status).toBe('extended');
      expect(week3.isExtended).toBe(true);
    }
  });
});

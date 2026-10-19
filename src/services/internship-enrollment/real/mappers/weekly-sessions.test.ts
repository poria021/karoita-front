import { describe, expect, it } from 'vitest';

import type { NestStudentWeek } from '@/types/nest-student-enrollments';

import { isAdvisorRejectionSuperseded, mapRealWeeklySessions, mapWeekStatus } from './weekly-sessions';

function week(partial: Partial<NestStudentWeek> & { id: string }): NestStudentWeek {
  return { ...partial };
}

const emptyMaps = { latest: new Map(), feedback: new Map() };

describe('mapRealWeeklySessions — sequential lock', () => {
  it('keeps the first week open even when never submitted', () => {
    const weeks = [week({ id: '1' })];
    const mapped = mapRealWeeklySessions(weeks, emptyMaps.latest, emptyMaps.feedback);
    expect(mapped[0]!.status).toBe('draft');
  });

  it('locks week 2 while week 1 has not been submitted', () => {
    const weeks = [week({ id: '1' }), week({ id: '2' })];
    const mapped = mapRealWeeklySessions(weeks, emptyMaps.latest, emptyMaps.feedback);
    expect(mapped[1]!.status).toBe('locked_future');
  });

  it('opens week 2 once week 1 studentStatus is send', () => {
    const weeks = [
      week({ id: '1', studentStatus: 'send' }),
      week({ id: '2' }),
    ];
    const mapped = mapRealWeeklySessions(weeks, emptyMaps.latest, emptyMaps.feedback);
    expect(mapped[1]!.status).toBe('draft');
  });

  it('opens week 2 once week 1 is completed even without studentStatus send', () => {
    const weeks = [
      week({ id: '1', status: 'completed', score: 90 }),
      week({ id: '2' }),
    ];
    const mapped = mapRealWeeklySessions(weeks, emptyMaps.latest, emptyMaps.feedback);
    expect(mapped[1]!.status).toBe('draft');
  });

  it('does not hide an already-progressed week behind the sequential lock', () => {
    // داده‌ی استثنا/قدیمی: هفتهٔ ۲ قبلاً ارسال شده با اینکه هفتهٔ ۱ هنوز drafte.
    const weeks = [
      week({ id: '1' }),
      week({ id: '2', studentStatus: 'send' }),
    ];
    const mapped = mapRealWeeklySessions(weeks, emptyMaps.latest, emptyMaps.feedback);
    expect(mapped[1]!.status).toBe('pending');
  });

  it('propagates the lock forward through consecutive unsent weeks', () => {
    const weeks = [
      week({ id: '1', studentStatus: 'send' }),
      week({ id: '2' }),
      week({ id: '3' }),
    ];
    const mapped = mapRealWeeklySessions(weeks, emptyMaps.latest, emptyMaps.feedback);
    expect(mapped[1]!.status).toBe('draft');
    expect(mapped[2]!.status).toBe('locked_future');
  });

  it('skips archived weeks in the sequential lock and keeps the first week after them open', () => {
    const weeks = [
      week({ id: '1', studentStatus: 'send' }),
      week({ id: '2', weekId: { id: 'w-2', status: false } }),
      week({ id: '3' }),
    ];
    const mapped = mapRealWeeklySessions(weeks, emptyMaps.latest, emptyMaps.feedback);
    expect(mapped[1]!.status).toBe('archived');
    expect(mapped[2]!.status).toBe('draft');
  });
});

describe('needs_edit after the student resubmits', () => {
  const rejected = week({
    id: '1',
    status: 'in_progress',
    mentorStatus: 'send',
    studentStatus: 'send',
    submittedAt: '2026-01-01T00:00:00.000Z',
  });

  it('stays needs_edit while the advisor rejection is the latest event', () => {
    const feedback = new Map([['1', { advisor: 'fix it', advisorAt: '2026-01-02T00:00:00.000Z' }]]);
    const latest = new Map([['1', { text: 'v1', files: [], createdAt: '2026-01-01T00:00:00.000Z' }]]);
    const mapped = mapRealWeeklySessions([rejected], latest, feedback);
    expect(mapped[0]!.status).toBe('needs_edit');
  });

  it('goes back to pending when the student resubmits even if the backend keeps mentorStatus=send', () => {
    const feedback = new Map([['1', { advisor: 'fix it', advisorAt: '2026-01-02T00:00:00.000Z' }]]);
    const latest = new Map([['1', { text: 'v2', files: [], createdAt: '2026-01-03T00:00:00.000Z' }]]);
    const mapped = mapRealWeeklySessions([rejected], latest, feedback);
    expect(mapped[0]!.status).toBe('pending');
  });

  it('uses week.submittedAt as resubmission evidence for the teacher panel mapper', () => {
    expect(mapWeekStatus(rejected)).toBe('needs_edit');
    expect(mapWeekStatus(rejected, { rejectionSuperseded: true })).toBe('pending');
  });

  it('never overrides a graded week', () => {
    const graded = week({ id: '1', status: 'completed', mentorStatus: 'send' });
    expect(mapWeekStatus(graded, { rejectionSuperseded: true })).toBe('graded');
  });

  it('isAdvisorRejectionSuperseded compares timestamps and tolerates missing values', () => {
    expect(isAdvisorRejectionSuperseded(undefined, ['2026-01-03T00:00:00.000Z'])).toBe(false);
    expect(isAdvisorRejectionSuperseded('2026-01-02T00:00:00.000Z', [null, undefined])).toBe(false);
    expect(isAdvisorRejectionSuperseded('2026-01-02T00:00:00.000Z', ['2026-01-01T00:00:00.000Z'])).toBe(false);
    expect(isAdvisorRejectionSuperseded('2026-01-02T00:00:00.000Z', ['2026-01-03T00:00:00.000Z'])).toBe(true);
  });
});

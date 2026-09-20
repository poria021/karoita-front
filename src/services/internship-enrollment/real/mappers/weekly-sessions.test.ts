import { describe, expect, it } from 'vitest';

import type { NestStudentWeek } from '@/types/nest-student-enrollments';

import { mapRealWeeklySessions } from './weekly-sessions';

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
});

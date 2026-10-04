import { describe, expect, it } from 'vitest';

import type { DailyApprovalTrainee, DailyApprovalWeek } from '@/types/daily-approvals';

import {
  forwardTargetForRole,
  maskUnforwardedWeeks,
} from './forward-visibility';

const week = (patch: Partial<DailyApprovalWeek>): DailyApprovalWeek => ({
  id: 'w1',
  weekNumber: 1,
  status: 'submitted' as DailyApprovalWeek['status'],
  score: null,
  text: 'گزارش',
  files: [],
  feedback: {},
  readBySupervisor: false,
  ...patch,
});

const trainee = (weeks: DailyApprovalWeek[]): DailyApprovalTrainee => ({
  id: 't1',
  traineeName: 'x',
  identifier: '1',
  major: 'm',
  schoolName: null,
  kind: 'internship',
  level: 1,
  courseKey: 'intern1',
  courseTitle: 'c',
  termId: 'term',
  termTitle: 'term',
  status: 'active',
  unreadCount: 0,
  hasSubmitted: true,
  progressiveGrade: { gradedCount: 0, final20: null, statusLabel: 'در جریان' },
  weeks,
});

describe('forward-visibility', () => {
  it('فقط معلم و مدیر مقصد ارجاع دارند', () => {
    expect(forwardTargetForRole('mentor_teacher')).toBe('mentor');
    expect(forwardTargetForRole('school_principal')).toBe('principal');
    expect(forwardTargetForRole('supervisor_professor')).toBeNull();
  });

  it('استاد همه‌چیز را می‌بیند', () => {
    const t = trainee([week({})]);
    expect(maskUnforwardedWeeks(t, 'supervisor_professor', 60)).toBe(t);
  });

  it('معلم/مدیر هفتهٔ ارجاع‌نشده را بدون محتوا می‌بینند', () => {
    const t = trainee([
      week({ id: 'a', forwardedTo: ['mentor'] }),
      week({ id: 'b' }),
    ]);
    const mentor = maskUnforwardedWeeks(t, 'mentor_teacher', 60);
    expect(mentor.weeks[0]!.text).toBe('گزارش');
    expect(mentor.weeks[1]!.status).toBe('draft');
    expect(mentor.weeks[1]!.text).toBe('');
    const principal = maskUnforwardedWeeks(t, 'school_principal', 60);
    expect(principal.weeks.every((w) => w.status === 'draft')).toBe(true);
    expect(principal.hasSubmitted).toBe(false);
  });
});

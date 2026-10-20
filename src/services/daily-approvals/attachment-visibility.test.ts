import { describe, expect, it } from 'vitest';

import {
  isAttachmentObserverRole,
  maskDetailAttachments,
  maskWeekAttachments,
} from '@/services/daily-approvals/attachment-visibility';
import type { DailyApprovalWeek, DailyApprovalWeekDetail } from '@/types/daily-approvals';

const FILE = { id: 'f1', name: 'report.pdf', sizeMb: 1.2, url: 'https://files.test/f1' };

function week(overrides: Partial<DailyApprovalWeek> = {}): DailyApprovalWeek {
  return {
    id: 'w1',
    weekNumber: 1,
    status: 'pending',
    score: null,
    text: 'گزارش هفته',
    files: [FILE],
    feedback: {},
    readBySupervisor: false,
    ...overrides,
  };
}

describe('attachment visibility (canWatchOthers)', () => {
  it('only teacher and principal are attachment observers', () => {
    expect(isAttachmentObserverRole('mentor_teacher')).toBe(true);
    expect(isAttachmentObserverRole('school_principal')).toBe(true);
    expect(isAttachmentObserverRole('supervisor_professor')).toBe(false);
    expect(isAttachmentObserverRole(null)).toBe(false);
  });

  it('hides files but keeps the report text for teacher/principal by default (flag unset or false)', () => {
    for (const role of ['mentor_teacher', 'school_principal'] as const) {
      for (const flag of [undefined, false]) {
        const masked = maskWeekAttachments(week({ canWatchOthers: flag }), role);
        expect(masked.files).toEqual([]);
        expect(masked.filesHidden).toBe(true);
        expect(masked.text).toBe('گزارش هفته');
        expect(masked.status).toBe('pending');
      }
    }
  });

  it('shows files to teacher/principal once the mentor sets canWatchOthers to true', () => {
    const open = week({ canWatchOthers: true });
    expect(maskWeekAttachments(open, 'mentor_teacher')).toBe(open);
    expect(maskWeekAttachments(open, 'school_principal').files).toEqual([FILE]);
  });

  it('never hides files from the supervising professor', () => {
    const closed = week({ canWatchOthers: false });
    expect(maskWeekAttachments(closed, 'supervisor_professor')).toBe(closed);
  });

  it('masks the loaded week detail the same way', () => {
    const detail: DailyApprovalWeekDetail = { text: 't', files: [FILE], feedback: {} };
    const hidden = maskDetailAttachments(detail, 'school_principal', false);
    expect(hidden.files).toEqual([]);
    expect(hidden.filesHidden).toBe(true);
    expect(hidden.text).toBe('t');
    expect(maskDetailAttachments(detail, 'school_principal', true)).toBe(detail);
    expect(maskDetailAttachments(detail, 'supervisor_professor', undefined)).toBe(detail);
  });
});

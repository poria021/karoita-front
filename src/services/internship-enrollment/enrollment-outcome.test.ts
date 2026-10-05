import { describe, expect, it } from 'vitest';

import { enrollmentOutcome } from '@/services/internship-enrollment/enrollment-mappers';
import { registeredSummaryFromEnrollment } from '@/services/internship-enrollment/real/mappers/enrollment-summary';

describe('enrollmentOutcome', () => {
  it('maps isPass on a completed enrolment to passed/failed', () => {
    expect(enrollmentOutcome('completed', true)).toBe('passed');
    expect(enrollmentOutcome('completed', false)).toBe('failed');
  });

  it('treats a missing pass flag as unknown, not as passed', () => {
    expect(enrollmentOutcome('completed', undefined)).toBeNull();
    expect(enrollmentOutcome('completed', null)).toBeNull();
  });

  it('has no outcome before the enrolment is completed', () => {
    expect(enrollmentOutcome('active', false)).toBeNull();
    expect(enrollmentOutcome('dropped', true)).toBeNull();
  });
});

describe('registeredSummaryFromEnrollment outcome', () => {
  const input = { kind: 'internship' as const, level: 1 as const, termTitle: 'نیم‌سال اول ۱۴۰۴' };
  const names = { supervisorName: null };

  it('marks a failed completed enrolment as failed', () => {
    const summary = registeredSummaryFromEnrollment(
      input,
      { id: 'e1', status: 'completed', isPass: false },
      names
    );
    expect(summary.status).toBe('completed');
    expect(summary.outcome).toBe('failed');
  });

  it('leaves the outcome unknown when the backend omits isPass', () => {
    const summary = registeredSummaryFromEnrollment(
      input,
      { id: 'e1', status: 'completed' },
      names
    );
    expect(summary.outcome).toBeNull();
  });
});

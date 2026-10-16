import { describe, expect, it } from 'vitest';

import { preferLatestEnrolments } from '@/services/internship-enrollment/real/mappers/lesson-matching';
import type { NestSemesterEnrolmentsByTerm } from '@/types/nest-student-enrollments';

const semesters: NestSemesterEnrolmentsByTerm[] = [
  {
    id: 's1',
    lessons: [
      {
        id: 'l1',
        semesterId: 's1',
        title: 'کارورزی ۱',
        enrolment: { id: 'old', semesterId: 's1', lessonId: 'l1', status: 'completed' },
      },
    ],
  },
] as NestSemesterEnrolmentsByTerm[];

describe('preferLatestEnrolments', () => {
  it('replaces the stale completed row with the new active retake in the same lesson', () => {
    const result = preferLatestEnrolments(semesters, [
      { id: 'new', semesterId: 's1', lessonId: 'l1', status: 'active', createdAt: '2026-10-01' },
      { id: 'old', semesterId: 's1', lessonId: 'l1', status: 'completed', createdAt: '2026-03-01' },
    ]);
    expect(result[0].lessons[0].enrolment?.id).toBe('new');
  });

  it('keeps the original enrolment when the list has no matching row', () => {
    const result = preferLatestEnrolments(semesters, []);
    expect(result[0].lessons[0].enrolment?.id).toBe('old');
  });

  it('ignores cancelled rows and picks the newest otherwise', () => {
    const result = preferLatestEnrolments(semesters, [
      { id: 'c', semesterId: 's1', lessonId: 'l1', status: 'cancelled', createdAt: '2026-10-05' },
      { id: 'a', semesterId: 's1', lessonId: 'l1', status: 'completed', createdAt: '2026-04-01' },
      { id: 'b', semesterId: 's1', lessonId: 'l1', status: 'completed', createdAt: '2026-06-01' },
    ]);
    expect(result[0].lessons[0].enrolment?.id).toBe('b');
  });
});

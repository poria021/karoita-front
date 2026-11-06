import { describe, expect, it } from 'vitest';

import type {
  AcademicTerm,
  CourseOfferingRecord,
  SyllabusConfigSnapshot,
} from '@/types/syllabus-config';

import {
  buildActiveTermCourses,
  buildActiveTermStatusView,
  pickLatestActiveTerm,
} from './active-term-status';

function term(partial: Partial<AcademicTerm> & Pick<AcademicTerm, 'id' | 'title' | 'type'>): AcademicTerm {
  return {
    isEnrollOpen: false,
    isTermOpen: false,
    enrollStart: '',
    termStart: '',
    ...partial,
  };
}

function offering(
  partial: Partial<CourseOfferingRecord> &
    Pick<CourseOfferingRecord, 'id' | 'termId' | 'courseCatalogId'>
): CourseOfferingRecord {
  return {
    title: 'درس',
    isOffered: true,
    weeks: [],
    ...partial,
  };
}

describe('active-term-status', () => {
  it('prefers the latest term-open semester', () => {
    const terms = [
      term({ id: '1', title: 'نیم‌سال قدیم', type: 'semester', isTermOpen: true }),
      term({ id: '2', title: 'نیم‌سال جدید', type: 'semester', isTermOpen: true }),
      term({ id: '3', title: 'پودمان', type: 'modular', isTermOpen: true }),
    ];
    expect(pickLatestActiveTerm(terms, 'semester')?.id).toBe('2');
    expect(pickLatestActiveTerm(terms, 'modular')?.id).toBe('3');
  });

  it('falls back to enroll-open then latest of type', () => {
    expect(
      pickLatestActiveTerm(
        [
          term({ id: 'a', title: 'الف', type: 'semester', isEnrollOpen: true }),
          term({ id: 'b', title: 'ب', type: 'semester' }),
        ],
        'semester'
      )?.id
    ).toBe('a');

    expect(
      pickLatestActiveTerm(
        [term({ id: 'x', title: 'تنها', type: 'modular' })],
        'modular'
      )?.id
    ).toBe('x');
  });

  it('lists offered courses with week counts for the active term', () => {
    const snapshot: SyllabusConfigSnapshot = {
      terms: [
        term({ id: 't1', title: 'نیم‌سال ۱۴۰۴', type: 'semester', isTermOpen: true }),
      ],
      offerings: {
        off1: offering({
          id: 'off1',
          termId: 't1',
          courseCatalogId: 'c1',
          title: 'کارورزی ۱',
          weeks: [
            { id: 'w1', suffix: '1', title: 'هفته ۱', weight: 1, status: 'active' },
            { id: 'w2', suffix: '2', title: 'هفته ۲', weight: 1, status: 'active' },
          ],
        }),
        off2: offering({
          id: 'off2',
          termId: 't1',
          courseCatalogId: 'c2',
          title: 'کارورزی ۲',
          isOffered: false,
          weeks: [
            { id: 'w3', suffix: '1', title: 'هفته ۱', weight: 1, status: 'active' },
          ],
        }),
      },
      internships: [],
      globalProfessorCapacity: 0,
      passingScoreThreshold: 10,
    };

    expect(buildActiveTermCourses(snapshot, snapshot.terms[0]!)).toEqual([
      { id: 'off1', title: 'کارورزی ۱', weekCount: 2 },
    ]);

    const view = buildActiveTermStatusView(snapshot, 'semester');
    expect(view.term?.title).toBe('نیم‌سال ۱۴۰۴');
    expect(view.courses).toHaveLength(1);
  });
});

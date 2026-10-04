import { describe, expect, it } from 'vitest';

import type { SyllabusConfigSnapshot } from '@/types/syllabus-config';

import {
  buildCourseOfferingId,
  getCatalogForTermType,
  listOfferingsForTerm,
  normalizeCourseTitle,
} from './syllabus-mappers';

describe('syllabus-mappers', () => {
  it('normalizes course titles to English digits', () => {
    expect(normalizeCourseTitle('کارورزی ۱')).toBe('کارورزی 1');
  });

  it('builds stable offering ids from termId + courseCatalogId', () => {
    expect(buildCourseOfferingId('term_2', 'course_internship_1')).toBe(
      'off_term_2_course_internship_1'
    );
  });

  it('lists catalog with stable ids', () => {
    const semester = getCatalogForTermType('semester');
    expect(semester).toHaveLength(4);
    expect(semester[0]?.id).toBe('course_internship_1');
    expect(getCatalogForTermType('modular')).toHaveLength(2);
  });

  it('maps offerings isOffered from offering flag', () => {
    const snapshot: SyllabusConfigSnapshot = {
      terms: [
        {
          id: 'term_2',
          title: 'نیم‌سال اول 1405-1406',
          type: 'semester',
          isEnrollOpen: false,
          isTermOpen: false,
          enrollStart: '',
          termStart: '',
        },
      ],
      offerings: {
        off_term_2_course_internship_1: {
          id: 'off_term_2_course_internship_1',
          termId: 'term_2',
          courseCatalogId: 'course_internship_1',
          isOffered: true,
          weeks: [
            {
              id: 'w1',
              suffix: 'هفته 1',
              title: 'هفته 1',
              weight: 3,
              status: 'active',
            },
          ],
        },
      },
      internships: [],
      globalProfessorCapacity: 15,
      passingScoreThreshold: 70,
    };

    const list = listOfferingsForTerm(snapshot, 'term_2');
    const first = list.find((i) => i.courseCatalogId === 'course_internship_1');
    const second = list.find((i) => i.courseCatalogId === 'course_internship_2');
    expect(first?.isOffered).toBe(true);
    expect(first?.courseOfferingId).toBe('off_term_2_course_internship_1');
    expect(second?.isOffered).toBe(false);
    expect(second?.courseOfferingId).toBeNull();
  });

});

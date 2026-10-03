import { describe, expect, it } from 'vitest';

import type { CourseDefinition } from '@/types/syllabus-config';

import {
  evaluationScopeKeys,
  getDailyApprovalCourseOptions,
} from './constants';

const WITH_SUBS: CourseDefinition = {
  id: 'course_internship',
  title: 'کارورزی',
  audience: 'semester',
  isActive: true,
  subModules: [
    { id: 'course_internship_1', title: 'کارورزی ۱' },
    { id: 'crs_new_m_1', title: 'کارورزی ویژه' },
  ],
};

const STANDALONE: CourseDefinition = {
  id: 'crs_workshop',
  title: 'کارگاه',
  audience: 'semester',
  isActive: true,
  subModules: [],
};

describe('daily approvals course options', () => {
  it('keeps the static list without a dynamic course (real mode)', () => {
    expect(getDailyApprovalCourseOptions('internship').map((o) => o.value)).toEqual(
      ['all', 'intern1', 'intern2', 'intern3', 'intern4']
    );
    expect(
      getDailyApprovalCourseOptions('apprenticeship').map((o) => o.value)
    ).toEqual(['all', 'appr1', 'appr2']);
  });

  it('lists only the sub-modules of the selected course, keeping legacy ids', () => {
    expect(
      getDailyApprovalCourseOptions('internship', WITH_SUBS).map((o) => o.value)
    ).toEqual(['all', 'intern1', 'crs_new_m_1']);
    expect(evaluationScopeKeys(WITH_SUBS)).toEqual(['intern1', 'crs_new_m_1']);
  });

  it('a course without sub-modules has a single option and scopes to itself', () => {
    expect(getDailyApprovalCourseOptions('internship', STANDALONE)).toHaveLength(
      1
    );
    expect(evaluationScopeKeys(STANDALONE)).toEqual(['crs_workshop']);
  });
});

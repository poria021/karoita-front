import { describe, expect, it } from 'vitest';

import type { CourseDefinition } from '@/types/syllabus-config';

import {
  evaluationRealScopeKeys,
  evaluationScopeKeys,
  getDailyApprovalCourseOptions,
  getRealDailyApprovalCourseOptions,
  scopeRealCatalogCoursesToModule,
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

const TERM_COURSES = [
  { id: 'les_1', title: 'کارورزی ۱', courseFilter: 'les_1' as const },
  { id: 'les_2', title: 'کارورزی ۲', courseFilter: 'les_2' as const },
  { id: 'les_9', title: 'کارگاه تدریس', courseFilter: 'les_9' as const },
  { id: 'les_special', title: 'کارورزی ویژه', courseFilter: 'les_special' as const },
];

describe('daily approvals course options', () => {
  it('keeps the static legacy list without a dynamic course (mock fixtures)', () => {
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

  it('real mode without a module lists every lesson of the term', () => {
    const options = getRealDailyApprovalCourseOptions([
      { id: 'les_1', title: 'کارورزی ۱', courseFilter: 'les_1' },
      { id: 'les_9', title: 'کارگاه تدریس', courseFilter: 'les_9' },
    ]);
    expect(options.map((o) => o.value)).toEqual(['all', 'les_1', 'les_9']);
    expect(options[0]?.label).toBe('همه دروس');
    expect(getRealDailyApprovalCourseOptions([]).map((o) => o.value)).toEqual([
      'all',
    ]);
  });

  it('real mode scopes dropdown options to the selected module by title', () => {
    const options = getRealDailyApprovalCourseOptions(TERM_COURSES, WITH_SUBS);
    expect(options.map((o) => o.value)).toEqual([
      'all',
      'les_1',
      'les_special',
    ]);
    expect(options[0]?.label).toBe('همه زیرمجموعه‌ها');
  });

  it('real mode matches module leaves by original-lesson id when titles differ', () => {
    const scoped = scopeRealCatalogCoursesToModule(
      [
        { id: 'crs_new_m_1', title: 'عنوان دیگر در ترم', courseFilter: 'crs_new_m_1' },
        { id: 'les_other', title: 'بی‌ربط', courseFilter: 'les_other' },
      ],
      WITH_SUBS
    );
    expect(scoped.map((c) => c.id)).toEqual(['crs_new_m_1']);
  });

  it('real mode standalone module collapses to a single option and scopes by title', () => {
    const workshopModule: CourseDefinition = {
      ...STANDALONE,
      title: 'کارگاه تدریس',
    };
    expect(
      getRealDailyApprovalCourseOptions(TERM_COURSES, workshopModule)
    ).toEqual([{ value: 'all', label: 'کارگاه تدریس' }]);
    expect(evaluationRealScopeKeys(TERM_COURSES, workshopModule)).toEqual([
      'les_9',
    ]);
  });

  it('evaluationRealScopeKeys is undefined without a module', () => {
    expect(evaluationRealScopeKeys(TERM_COURSES, null)).toBeUndefined();
  });
});

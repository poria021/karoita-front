import { beforeEach, describe, expect, it } from 'vitest';

import {
  buildCourseDefinition,
  cloneDefaultCourseDefinitions,
} from '@/services/syllabus-config/course-catalog';
import {
  mutateSyllabusSnapshot,
  resetSyllabusSnapshotForTests,
} from '@/services/syllabus-config/mock/mock-syllabus-store';

import {
  getMockOrganizationalCapacities,
  resetMockOrganizationalCapacitiesForTests,
  submitMockOrganizationalCapacities,
  updateMockOrganizationalCapacityCourse,
} from './mock-organizational-capacities-store';

const ACTOR = 'supervisor-test-1';

describe('mock organizational capacities store', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetMockOrganizationalCapacitiesForTests(null);
    resetSyllabusSnapshotForTests(null);
  });

  it('seeds internship courses and keeps a single mutual day', () => {
    const snapshot = getMockOrganizationalCapacities(
      { kind: 'internship', termId: 'term_2' },
      ACTOR
    );
    expect(snapshot.courses).toHaveLength(4);
    expect(snapshot.status).toBe('draft');

    const next = updateMockOrganizationalCapacityCourse(
      {
        kind: 'internship',
        termId: snapshot.termId,
        courseId: snapshot.courses[0]!.id,
        total: 12,
        selectedDays: ['sat', 'mon'],
      },
      ACTOR
    );
    expect(next.courses[0]?.total).toBe(12);
    expect(next.courses[0]?.selectedDays).toEqual(['mon']);
  });

  it('allows updating capacities repeatedly even after submit', () => {
    const snapshot = getMockOrganizationalCapacities(
      { kind: 'apprenticeship', termId: 'term_modular_1' },
      ACTOR
    );
    const submitted = submitMockOrganizationalCapacities(
      {
        kind: 'apprenticeship',
        termId: snapshot.termId,
        courses: snapshot.courses.map((course) => ({
          courseId: course.id,
          total: course.total,
          selectedDays: course.selectedDays,
        })),
      },
      ACTOR
    );
    expect(submitted.status).toBe('draft');

    const updated = updateMockOrganizationalCapacityCourse(
      {
        kind: 'apprenticeship',
        termId: snapshot.termId,
        courseId: snapshot.courses[0]!.id,
        total: 10,
        selectedDays: ['tue'],
      },
      ACTOR
    );
    expect(updated.courses[0]?.total).toBe(10);
  });

  it('builds courses from the active catalog, grouping sub-modules under their course', () => {
    mutateSyllabusSnapshot((draft) => {
      const catalog = draft.courseCatalog ?? cloneDefaultCourseDefinitions();
      catalog.push(
        buildCourseDefinition({
          title: 'پروژه',
          audience: 'semester',
          isActive: true,
          subModules: [{ title: 'پروژه الف' }, { title: 'پروژه ب' }],
        }),
        buildCourseDefinition({
          title: 'کارگاه',
          audience: 'semester',
          isActive: true,
          subModules: [],
        }),
        buildCourseDefinition({
          title: 'خاموش',
          audience: 'semester',
          isActive: false,
          subModules: [],
        })
      );
      draft.courseCatalog = catalog;
    });

    const snapshot = getMockOrganizationalCapacities(
      { kind: 'internship', termId: 'term_2' },
      ACTOR
    );
    expect(snapshot.courses.map((c) => c.title)).toEqual([
      'کارورزی ۱',
      'کارورزی ۲',
      'کارورزی ۳',
      'کارورزی ۴',
      'پروژه الف',
      'پروژه ب',
      'کارگاه',
    ]);
    expect(snapshot.courses[4]).toMatchObject({ groupTitle: 'پروژه' });
    expect(snapshot.courses[6]?.groupId).toBeUndefined();

    const modular = getMockOrganizationalCapacities(
      { kind: 'apprenticeship', termId: 'term_modular_1' },
      ACTOR
    );
    expect(modular.courses).toHaveLength(2);
  });

  it('keeps saved capacity when the catalog changes and drops removed courses', () => {
    const first = getMockOrganizationalCapacities(
      { kind: 'internship', termId: 'term_2' },
      ACTOR
    );
    updateMockOrganizationalCapacityCourse(
      {
        kind: 'internship',
        termId: first.termId,
        courseId: 'course_internship_2',
        total: 7,
        selectedDays: ['wed'],
      },
      ACTOR
    );

    mutateSyllabusSnapshot((draft) => {
      draft.courseCatalog = (draft.courseCatalog ?? []).map((course) =>
        course.id === 'course_internship'
          ? {
              ...course,
              subModules: course.subModules.filter(
                (sub) => sub.id !== 'course_internship_4'
              ),
            }
          : course
      );
    });

    const next = getMockOrganizationalCapacities(
      { kind: 'internship', termId: first.termId },
      ACTOR
    );
    expect(next.courses).toHaveLength(3);
    expect(next.courses.find((c) => c.id === 'course_internship_2')).toMatchObject({
      total: 7,
      selectedDays: ['wed'],
    });
  });
});

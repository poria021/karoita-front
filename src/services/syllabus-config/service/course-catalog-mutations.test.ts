import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./gates', () => ({
  gateSyllabus: () => {},
  gateSyllabusTermSettings: () => {},
  gateSyllabusConsumerRead: () => {},
}));

import { resetSyllabusSnapshotForTests } from '@/services/syllabus-config/mock/mock-syllabus-store';
import { buildCourseOfferingId } from '@/services/syllabus-config/syllabus-mappers';

import { courseCatalogMutations } from './course-catalog-mutations';
import { courseOfferingQueries } from './course-offering-queries';
import { offeringMutations } from './offering-mutations';

describe('course catalog mutations (mock)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetSyllabusSnapshotForTests(null);
  });

  it('new standalone course appears in offerings of its audience only', async () => {
    await courseCatalogMutations.createCourseDefinition({
      title: 'کارگاه ایمنی',
      audience: 'modular',
      isActive: true,
      subModules: [],
    });
    const modular = await courseOfferingQueries.listCoursesForTerm('term_modular_1');
    expect(modular.map((c) => c.title)).toContain('کارگاه ایمنی');
    const semester = await courseOfferingQueries.listCoursesForTerm('term_1');
    expect(semester.map((c) => c.title)).not.toContain('کارگاه ایمنی');
  });

  it('course with sub-modules exposes each sub-module grouped under its title', async () => {
    await courseCatalogMutations.createCourseDefinition({
      title: 'پروژه',
      audience: 'semester',
      isActive: true,
      subModules: [{ title: 'پروژه الف' }, { title: 'پروژه ب' }],
    });
    const courses = await courseOfferingQueries.listCoursesForTerm('term_1');
    const project = courses.filter((c) => c.groupTitle === 'پروژه');
    expect(project.map((c) => c.title)).toEqual(['پروژه الف', 'پروژه ب']);
  });

  it('blocks deleting or deactivating a course with an active offering', async () => {
    await offeringMutations.activateOffering({ termId: 'term_1', courseCatalogId: 'course_internship_1' });
    await expect(courseCatalogMutations.deleteCourseDefinition('course_internship')).rejects.toThrow();
    await expect(courseCatalogMutations.setCourseDefinitionActive('course_internship', false)).rejects.toThrow();

    await offeringMutations.deactivateOffering({
      courseOfferingId: buildCourseOfferingId('term_1', 'course_internship_1'),
    });
    const snapshot = await courseCatalogMutations.deleteCourseDefinition('course_internship');
    expect(snapshot.courseCatalog?.some((c) => c.id === 'course_internship')).toBe(false);
    expect(await courseOfferingQueries.listCoursesForTerm('term_1')).toHaveLength(0);
  });
});

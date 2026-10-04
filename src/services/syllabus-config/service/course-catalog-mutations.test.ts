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

  it('never hard-deletes a course that was ever offered, even after deactivating it', async () => {
    const offeringId = buildCourseOfferingId('term_1', 'course_internship_1');
    await offeringMutations.activateOffering({ termId: 'term_1', courseCatalogId: 'course_internship_1' });
    await expect(courseCatalogMutations.deleteCourseDefinition('course_internship')).rejects.toThrow(/بایگانی/);

    await offeringMutations.deactivateOffering({ courseOfferingId: offeringId });
    await expect(courseCatalogMutations.deleteCourseDefinition('course_internship')).rejects.toThrow(/بایگانی/);

    // سابقهٔ ارائه (و سرفصل‌های ترم) دست‌نخورده می‌ماند.
    const defs = await courseCatalogMutations.listCourseDefinitions();
    expect(defs.some((c) => c.id === 'course_internship')).toBe(true);
    const snapshot = await courseCatalogMutations.updateCourseDefinition('course_internship', {
      title: 'کارورزی',
      audience: 'semester',
      isActive: false,
      subModules: defs.find((c) => c.id === 'course_internship')!.subModules,
    });
    expect(snapshot.offerings[offeringId]).toBeDefined();
  });

  it('hard-deletes a course that has no offering or syllabus anywhere', async () => {
    const created = await courseCatalogMutations.createCourseDefinition({
      title: 'درس اشتباه',
      audience: 'semester',
      isActive: true,
      subModules: [],
    });
    const id = created.courseCatalog!.find((c) => c.title === 'درس اشتباه')!.id;
    const snapshot = await courseCatalogMutations.deleteCourseDefinition(id);
    expect(snapshot.courseCatalog?.some((c) => c.id === id)).toBe(false);
  });

  it('an archived course no longer shows up for new terms but keeps its past offering', async () => {
    const offeringId = buildCourseOfferingId('term_1', 'course_internship_1');
    await offeringMutations.activateOffering({ termId: 'term_1', courseCatalogId: 'course_internship_1' });
    await offeringMutations.deactivateOffering({ courseOfferingId: offeringId });
    const defs = await courseCatalogMutations.listCourseDefinitions();
    const internship = defs.find((c) => c.id === 'course_internship')!;
    await courseCatalogMutations.updateCourseDefinition('course_internship', {
      title: internship.title,
      audience: internship.audience,
      isActive: false,
      subModules: internship.subModules,
    });
    expect(await courseOfferingQueries.listCoursesForTerm('term_1')).toHaveLength(0);
    const snapshot = await courseCatalogMutations.listCourseDefinitions();
    expect(snapshot.find((c) => c.id === 'course_internship')?.isActive).toBe(false);
  });
});

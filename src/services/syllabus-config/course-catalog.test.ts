import { describe, expect, it } from 'vitest';

import {
  buildCourseDefinition,
  DEFAULT_COURSE_DEFINITIONS,
  flattenCourseCatalog,
  leafIdsOfCourse,
  validateCourseDefinitionInput,
} from '@/services/syllabus-config/course-catalog';
import { catalogIdForKind } from '@/services/syllabus-config/syllabus-mappers';
import type { CourseDefinition } from '@/types/syllabus-config';

describe('course catalog', () => {
  it('keeps legacy leaf ids for seeded sub-modules', () => {
    const semester = flattenCourseCatalog(DEFAULT_COURSE_DEFINITIONS, 'semester');
    expect(semester.map((c) => c.id)).toEqual([1, 2, 3, 4].map((n) => catalogIdForKind('internship', n)));
    expect(semester[0]).toMatchObject({ title: 'کارورزی ۱', groupTitle: 'کارورزی', type: 'internship' });
    expect(flattenCourseCatalog(DEFAULT_COURSE_DEFINITIONS, 'modular')).toHaveLength(2);
  });

  it('treats a course without sub-modules as its own module and hides inactive ones', () => {
    const defs: CourseDefinition[] = [
      { id: 'c1', title: 'کارگاه', audience: 'semester', isActive: true, subModules: [] },
      { id: 'c2', title: 'خاموش', audience: 'semester', isActive: false, subModules: [] },
    ];
    expect(flattenCourseCatalog(defs, 'semester')).toEqual([
      { id: 'c1', title: 'کارگاه', type: 'internship' },
    ]);
    expect(leafIdsOfCourse(defs[0]!)).toEqual(['c1']);
  });

  it('preserves known sub-module ids on edit and mints new ones', () => {
    const existing = DEFAULT_COURSE_DEFINITIONS[0]!;
    const next = buildCourseDefinition(
      {
        title: ' کارورزی ',
        audience: 'semester',
        isActive: true,
        subModules: [{ id: existing.subModules[1]!.id, title: 'دوم' }, { title: 'جدید' }],
      },
      existing
    );
    expect(next.id).toBe(existing.id);
    expect(next.title).toBe('کارورزی');
    expect(next.subModules[0]!.id).toBe(existing.subModules[1]!.id);
    expect(next.subModules[1]!.id).not.toBe(existing.subModules[0]!.id);
  });

  it('rejects empty, duplicate titles and duplicate sub-modules', () => {
    const base = { audience: 'semester' as const, isActive: true, subModules: [] };
    expect(validateCourseDefinitionInput({ ...base, title: ' ' }, [])).toBeTruthy();
    expect(validateCourseDefinitionInput({ ...base, title: 'کارورزی' }, DEFAULT_COURSE_DEFINITIONS)).toBeTruthy();
    expect(validateCourseDefinitionInput({ ...base, audience: 'modular', title: 'کارورزی' }, DEFAULT_COURSE_DEFINITIONS)).toBeNull();
    expect(
      validateCourseDefinitionInput({ ...base, title: 'x', subModules: [{ title: 'a' }, { title: 'a' }] }, [])
    ).toBeTruthy();
  });
});

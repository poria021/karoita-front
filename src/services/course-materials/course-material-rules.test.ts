import { describe, expect, it } from 'vitest';

import {
  buildCourseMaterial,
  canPublishCourseMaterials,
  COURSE_MATERIAL_MAX_BYTES,
  isCourseMaterialForCourse,
  isCourseMaterialOwnedBy,
  validateCourseMaterialInput,
} from './course-material-rules';

const base = {
  courseKey: 'intern1',
  title: 'جزوهٔ جلسه اول',
  description: '',
  file: { name: 'notes.pdf', size: 1000 },
};

describe('course-material-rules', () => {
  it('فقط استاد راهنما منتشر می‌کند', () => {
    expect(canPublishCourseMaterials('supervisor_professor')).toBe(true);
    expect(canPublishCourseMaterials('mentor_teacher')).toBe(false);
    expect(canPublishCourseMaterials('school_principal')).toBe(false);
    expect(canPublishCourseMaterials('student')).toBe(false);
    expect(canPublishCourseMaterials(undefined)).toBe(false);
  });

  it('ورودی معتبر null برمی‌گرداند', () => {
    expect(validateCourseMaterialInput(base, 'supervisor_professor')).toBeNull();
  });

  it('نقش نامجاز، فرمت، حجم و عنوان خالی را رد می‌کند', () => {
    expect(validateCourseMaterialInput(base, 'student')).not.toBeNull();
    expect(
      validateCourseMaterialInput(
        { ...base, file: { name: 'a.exe', size: 10 } },
        'supervisor_professor'
      )
    ).toBe('فرمت فایل مجاز نیست.');
    expect(
      validateCourseMaterialInput(
        { ...base, file: { name: 'a.pdf', size: COURSE_MATERIAL_MAX_BYTES + 1 } },
        'supervisor_professor'
      )
    ).toMatch(/حجم/);
    expect(
      validateCourseMaterialInput({ ...base, title: ' ' }, 'supervisor_professor')
    ).toBe('عنوان الزامی است.');
  });

  it('مالکیت و تطبیق درس', () => {
    const material = buildCourseMaterial(
      {
        kind: 'internship',
        courseKey: 'intern1',
        courseLabel: 'کارورزی ۱',
        title: ' t ',
        description: '',
        fileName: 'a.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1,
        fileUrl: 'data:',
      },
      { id: 'u1', role: 'supervisor_professor', name: 'استاد' }
    );
    expect(material.title).toBe('t');
    expect(isCourseMaterialOwnedBy(material, 'u1')).toBe(true);
    expect(isCourseMaterialOwnedBy(material, 'u2')).toBe(false);
    expect(isCourseMaterialForCourse(material, 'internship', 'intern1')).toBe(true);
    expect(isCourseMaterialForCourse(material, 'apprenticeship', 'intern1')).toBe(
      false
    );
  });
});

import {
  findLeafByEnrollmentLevel,
  siblingEnrollmentLeaves,
} from '@/services/syllabus-config/course-catalog';
import { listRealCourseDefinitions } from '@/services/syllabus-config/real/real-course-catalog';
import type { CourseDefinition } from '@/types/syllabus-config';
import type {
  InternshipCourseKind,
  InternshipEnrollmentLevel,
} from '@/types/internship-enrollment';

import type { EnrollmentLeafRef } from './lesson-matching';

function audienceForKind(kind: InternshipCourseKind) {
  return kind === 'apprenticeship' ? 'modular' : 'semester';
}

/** leaf مسیر انتخاب واحد از روی کاتالوگ «تعریف دروس» (عنوان برای تطبیق Nest). */
export function leafRefForEnrollmentLevel(
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel,
  definitions: readonly CourseDefinition[]
): EnrollmentLeafRef {
  const leaf = findLeafByEnrollmentLevel(
    definitions,
    audienceForKind(kind),
    level
  );
  return { level, title: leaf?.title ?? '' };
}

/** سایر زیرمجموعه‌های همان درس کاتالوگ — ورودی S6 دانشجو. */
export function siblingLeafRefsForEnrollmentLevel(
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel,
  definitions: readonly CourseDefinition[]
): EnrollmentLeafRef[] {
  return siblingEnrollmentLeaves(
    definitions,
    audienceForKind(kind),
    level
  ).map((leaf) => ({ level: leaf.level, title: leaf.title }));
}

export type EnrollmentCatalogContext = {
  leaf: EnrollmentLeafRef;
  siblingLeaves: EnrollmentLeafRef[];
};

/**
 * عنوان و هم‌گروه‌های leaf را از کاتالوگ می‌گیرد.
 * شکست کاتالوگ نباید کل صفحه را بترکاند — بدون عنوان فقط تطبیق سطح کلاسیک می‌ماند
 * و بدون sibling تعارض S6 اعمال نمی‌شود.
 */
export async function loadEnrollmentCatalogContext(
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel
): Promise<EnrollmentCatalogContext> {
  try {
    const definitions = await listRealCourseDefinitions();
    return {
      leaf: leafRefForEnrollmentLevel(kind, level, definitions),
      siblingLeaves: siblingLeafRefsForEnrollmentLevel(kind, level, definitions),
    };
  } catch {
    return { leaf: { level, title: '' }, siblingLeaves: [] };
  }
}

/** سازگاری با callsiteهایی که فقط عنوان leaf را می‌خواهند. */
export async function loadEnrollmentLeafRef(
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel
): Promise<EnrollmentLeafRef> {
  return (await loadEnrollmentCatalogContext(kind, level)).leaf;
}

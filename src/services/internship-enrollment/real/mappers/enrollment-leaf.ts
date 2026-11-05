import { findLeafByEnrollmentLevel } from '@/services/syllabus-config/course-catalog';
import { listRealCourseDefinitions } from '@/services/syllabus-config/real/real-course-catalog';
import type { CourseDefinition } from '@/types/syllabus-config';
import type {
  InternshipCourseKind,
  InternshipEnrollmentLevel,
} from '@/types/internship-enrollment';

import type { EnrollmentLeafRef } from './lesson-matching';

/** leaf مسیر انتخاب واحد از روی کاتالوگ «تعریف دروس» (عنوان برای تطبیق Nest). */
export function leafRefForEnrollmentLevel(
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel,
  definitions: readonly CourseDefinition[]
): EnrollmentLeafRef {
  const audience = kind === 'apprenticeship' ? 'modular' : 'semester';
  const leaf = findLeafByEnrollmentLevel(definitions, audience, level);
  return { level, title: leaf?.title ?? '' };
}

/**
 * عنوان کاتالوگ leaf را برای مسیر real می‌گیرد تا `findLessonForLeaf` بتواند
 * درس‌های داینامیک (بدون «کارورزی N» در عنوان Nest) را پیدا کند.
 * شکست کاتالوگ نباید کل صفحه را بترکاند — بدون عنوان، فقط تطبیق سطح کلاسیک می‌ماند.
 */
export async function loadEnrollmentLeafRef(
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel
): Promise<EnrollmentLeafRef> {
  try {
    const definitions = await listRealCourseDefinitions();
    return leafRefForEnrollmentLevel(kind, level, definitions);
  } catch {
    return { level, title: '' };
  }
}

import { isDynamicEnrollmentLevel } from '@/services/syllabus-config/course-catalog';
import type { InternshipEnrollmentLevel } from '@/types/internship-enrollment';

/**
 * پارس سگمنت پویای `[level]` — فقط رقم انگلیسی.
 * ۱..۴ سطح ثابت؛ عدد صحیح بالای ۱۰۰ سطح مجازی leaf داینامیک (صفحه خودش وجود آن را چک می‌کند).
 */
export function parseInternshipEnrollmentLevel(
  raw: string
): InternshipEnrollmentLevel | null {
  const n = Number(raw);
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  if (Number.isInteger(n) && isDynamicEnrollmentLevel(n)) return n;
  return null;
}

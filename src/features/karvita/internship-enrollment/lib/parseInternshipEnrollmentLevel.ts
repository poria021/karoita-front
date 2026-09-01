import type { InternshipEnrollmentLevel } from '@/types/internship-enrollment';

/** پارس سگمنت پویای `[level]` — فقط رقم انگلیسی. */
export function parseInternshipEnrollmentLevel(
  raw: string
): InternshipEnrollmentLevel | null {
  const n = Number(raw);
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return null;
}

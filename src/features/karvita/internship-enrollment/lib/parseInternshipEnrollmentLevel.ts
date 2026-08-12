import type { InternshipEnrollmentLevel } from '@/types/internship-enrollment';

/** Parses dynamic `[level]` route segment — English digits only (rule 85). */
export function parseInternshipEnrollmentLevel(
  raw: string
): InternshipEnrollmentLevel | null {
  const n = Number(raw);
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return null;
}

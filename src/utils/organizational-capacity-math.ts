import type { OrganizationalCapacityCourse } from '@/types/organizational-capacities';
import { persianToEnglishDigits } from '@/utils/persianDigits';

export function summarizeCapacityCourses(
  courses: readonly OrganizationalCapacityCourse[]
): {
  total: number | 'unlimited';
  confirmed: number;
  remaining: number | 'unlimited';
} {
  const confirmed = courses.reduce((sum, course) => sum + course.confirmed, 0);
  if (courses.some((course) => course.total === null)) {
    return { total: 'unlimited', confirmed, remaining: 'unlimited' };
  }
  const total = courses.reduce((sum, course) => sum + (course.total ?? 0), 0);
  return {
    total,
    confirmed,
    remaining: Math.max(0, total - confirmed),
  };
}

export function normalizeCapacityTotalInput(
  raw: string,
  maxCapacity: number
): number {
  const digits = persianToEnglishDigits(raw).replace(/[^\d]/g, '');
  if (digits === '') return 0;
  const value = Number(digits);
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(0, value), maxCapacity);
}

import type { SyllabusWeek } from '@/types/syllabus-config';

/** آخرین سطر همیشه؛ اگر آخرین آرشیو باشد، سطر قبلی هم فعال است. */
export function isWeekRowActionable(
  index: number,
  weeks: SyllabusWeek[]
): boolean {
  if (weeks.length === 0) return false;
  const lastIndex = weeks.length - 1;
  if (index === lastIndex) return true;
  const lastWeek = weeks[lastIndex];
  return lastWeek?.status === 'archived' && index === lastIndex - 1;
}

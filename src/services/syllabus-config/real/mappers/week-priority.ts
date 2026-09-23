import { DEFAULT_WEEK_WEIGHT } from '@/services/syllabus-config/syllabus-term-gates';

/** Nest `priority` همان ضریب اهمیت UI است؛ فقط ۱…۵. شماره هفته ایندکس آرایه است. */
const NEST_WEEK_PRIORITY_MIN = 1;
const NEST_WEEK_PRIORITY_MAX = 5;

export function nestPriorityFromWeight(
  weight: number,
  fallback: number = DEFAULT_WEEK_WEIGHT
): number {
  if (
    Number.isInteger(weight) &&
    weight >= NEST_WEEK_PRIORITY_MIN &&
    weight <= NEST_WEEK_PRIORITY_MAX
  ) {
    return weight;
  }
  if (
    Number.isInteger(fallback) &&
    fallback >= NEST_WEEK_PRIORITY_MIN &&
    fallback <= NEST_WEEK_PRIORITY_MAX
  ) {
    return fallback;
  }
  return DEFAULT_WEEK_WEIGHT;
}

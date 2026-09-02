import { lessonLevelFromTitle } from '@/services/organizational-capacities/real/real-organizational-capacities-mappers';
import type {
  DailyApprovalCatalogCourse,
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalWeekOption,
} from '@/types/daily-approvals';
import { toPersianDigits } from '@/utils/persianDigits';

export function toDailyApprovalCourseFilter(
  kind: DailyApprovalCourseKind,
  title: string
): Exclude<DailyApprovalCourseFilter, 'all'> {
  const level = lessonLevelFromTitle(title);
  if (kind === 'internship') {
    const internLevel = Math.min(4, Math.max(1, level)) as 1 | 2 | 3 | 4;
    return `intern${internLevel}`;
  }
  return level >= 2 ? 'appr2' : 'appr1';
}

export function toDailyApprovalCatalogCourses(
  kind: DailyApprovalCourseKind,
  rows: Array<{ id: string; title: string }>
): DailyApprovalCatalogCourse[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    courseFilter: toDailyApprovalCourseFilter(kind, row.title),
  }));
}

export function toDailyApprovalWeekOptions(
  weeks: Array<{ title?: string }>
): DailyApprovalWeekOption[] {
  return weeks.map((week, index) => {
    const weekNumber = index + 1;
    const title = week.title?.trim();
    return {
      value: String(weekNumber),
      label: title ? toPersianDigits(title) : `هفته ${toPersianDigits(weekNumber)}`,
      weekNumber,
    };
  });
}

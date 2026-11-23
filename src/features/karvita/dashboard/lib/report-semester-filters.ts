import type { UserRole } from '@/types/auth';
import type { NestSemester } from '@/types/nest-admin';
import type { LessonReportFilter } from '@/services/reports/real/lesson-reports.api';

import { kindsForRole, pickCurrentSemester } from './current-terms';

/**
 * فیلتر درخواست‌های گزارش درس (`pending-reviews` / `average-scores`) برای
 * ترم جاری هر مسیر. سرور بدون `semesterId` همهٔ نیم‌سال‌ها را جمع می‌زند، پس
 * ترم را خودمان می‌فرستیم. `structure` باید با ترم بخواند وگرنه سرور ۴۰۰ می‌دهد
 * (`CurrentTermKind` دقیقاً همان `semester` / `podmani` است).
 *
 * - ترمی و پودمانی هر کدام ترم جاری جدا دارند؛ برای هر کدام یک فیلتر.
 * - مسیری که ترم جاری ندارد فیلتری نمی‌گیرد (نه «همهٔ ترم‌ها»).
 */
export function currentSemesterReportFilters(
  semesters: readonly NestSemester[],
  role: UserRole
): LessonReportFilter[] {
  return kindsForRole(role).flatMap((kind) => {
    const current = pickCurrentSemester(semesters, kind);
    return current ? [{ semesterId: current.id, structure: kind }] : [];
  });
}

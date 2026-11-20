import { REPORT_ACCESS_EXTRA } from '@/features/karvita/report-access/constants';
import type {
  ReportAccessRoleRow,
  ReportAccessRow,
} from '@/types/report-access';

/**
 * گزارش‌های `REPORT_ACCESS_EXTRA` که در پاسخ Nest نیستند را به‌صورت
 * optional/inactive اضافه می‌کند تا مدیر ارشد بتواند اعطایشان کند.
 * اگر Nest ردیف را برگردانده باشد، همان وضعیت API حفظ می‌شود.
 */
export function withCatalogOptionalReports(
  rows: readonly ReportAccessRoleRow[]
): ReportAccessRoleRow[] {
  return rows.map((row) => {
    const extras = REPORT_ACCESS_EXTRA[row.roleId];
    if (!extras?.length) {
      return { roleId: row.roleId, reports: row.reports.slice() };
    }

    const reports: ReportAccessRow[] = row.reports.slice();
    const have = new Set(reports.map((r) => r.slug));
    for (const slug of extras) {
      if (have.has(slug)) continue;
      reports.push({
        slug,
        access: 'optional',
        status: 'inactive',
        enabled: false,
      });
      have.add(slug);
    }
    return { roleId: row.roleId, reports };
  });
}

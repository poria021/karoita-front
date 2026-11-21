import {
  REPORT_PAGE_DEFS,
  REPORT_THEMES,
  filterEnabledReportSlugs,
  isEnabledReportSlug,
} from '@/features/karvita/reports/constants';
import { reportPath } from '@/features/karvita/reports/lib/report-path';
import type { ReportSlug } from '@/types/report-access';
import type { SidebarMenuGroup, SidebarMenuItem } from '@/utils/role-strategy/types';

const THEME_ICONS: Record<string, string> = {
  lists: 'fa-table-columns',
  attendance: 'fa-clipboard-check',
  performance: 'fa-chart-column',
};

function adminReportMenuItem(
  slug: ReportSlug,
  disabled = false
): SidebarMenuItem {
  const def = REPORT_PAGE_DEFS[slug];
  return {
    title: def.title,
    path: reportPath(slug),
    icon: def.icon,
    ...(disabled ? { disabled: true } : {}),
  };
}

/**
 * منوی گزارش پنل ادمین از `GET /reports/access/me`.
 * - `granted === null` → هنوز بارگذاری نشده.
 * - active در منو باز؛ inactive غیرفعال؛ غایب اصلاً نیست.
 */
export function adminReportsMenuGroupsFromMe(
  granted: readonly ReportSlug[] | null,
  inactive: readonly ReportSlug[] = [],
  role?: string | null
): SidebarMenuGroup[] | null {
  if (granted === null) return null;

  const grantedSet = new Set(granted);
  const inactiveOnly = inactive.filter((slug) => !grantedSet.has(slug));
  const visible = new Set(
    filterEnabledReportSlugs([...granted, ...inactiveOnly], role)
  );
  const disabled = new Set(
    inactiveOnly.filter((slug) => isEnabledReportSlug(slug, role))
  );

  return REPORT_THEMES.map((theme) => ({
    kind: 'group' as const,
    title: theme.title,
    icon: THEME_ICONS[theme.id] ?? 'fa-file-invoice',
    children: theme.slugs
      .filter((slug) => visible.has(slug))
      .map((slug) => adminReportMenuItem(slug, disabled.has(slug))),
  })).filter((group) => group.children.length > 0);
}

'use client';

import { useMemo } from 'react';

import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { SidebarNavGroup } from '@/components/shared/shell/SidebarNavGroup';
import {
  REPORT_PAGE_DEFS,
  enabledReportThemes,
} from '@/features/karvita/reports/constants';
import { reportPath } from '@/features/karvita/reports/lib/report-path';
import type { ReportSlug } from '@/types/report-access';
import type { SidebarMenuGroup } from '@/utils/RoleStrategyMap';

type ReportCategoryNavProps = {
  slug: ReportSlug;
};

const THEME_ICONS: Record<string, string> = {
  lists: 'fa-table-columns',
  attendance: 'fa-clipboard-check',
  performance: 'fa-chart-column',
};

/** ناو موبایل گزارش‌ها — گروه‌های باز/بسته مثل سایدبار. */
export function ReportCategoryNav({ slug }: ReportCategoryNavProps) {
  const pathname = reportPath(slug);
  const groups = useMemo<SidebarMenuGroup[]>(
    () =>
      enabledReportThemes().map((theme) => ({
        kind: 'group' as const,
        title: theme.title,
        icon: THEME_ICONS[theme.id] ?? 'fa-file-invoice',
        children: theme.slugs.map((s) => {
          const def = REPORT_PAGE_DEFS[s];
          return {
            title: def.title,
            path: reportPath(s),
            icon: def.icon,
          };
        }),
      })),
    []
  );

  return (
    <KvCard className="min-w-0" aria-label="گزارش‌گیری">
      <KvCardContent padding="sm" className="space-y-kv-inline p-kv-pair">
        {groups.map((group) => (
          <SidebarNavGroup
            key={group.title}
            group={group}
            pathname={pathname}
            isCollapsed={false}
            locked={false}
            onNavigate={() => undefined}
            textSize="legible"
            defaultOpenWhenActive
          />
        ))}
      </KvCardContent>
    </KvCard>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { kvScrollAreaClassName } from '@/components/shared/KvScrollArea';
import { SidebarNavGroup } from '@/components/shared/shell/SidebarNavGroup';
import {
  kvShellAdminRailWidthMotionClassName,
  kvShellAdminReportsSecondaryRailOffsetClassName,
  kvShellAdminReportsSecondaryRailWidthClassName,
} from '@/components/shared/shell/shellChrome';
import {
  REPORT_PAGE_DEFS,
  enabledReportThemes,
} from '@/features/karvita/reports/constants';
import {
  isAdminReportsPath,
  reportPath,
} from '@/features/karvita/reports/lib/report-path';
import { cn } from '@/lib/utils';
import type { SidebarMenuGroup } from '@/utils/RoleStrategyMap';

const THEME_ICONS: Record<string, string> = {
  lists: 'fa-table-columns',
  attendance: 'fa-clipboard-check',
  performance: 'fa-chart-column',
};

/**
 * ریل دوم چسبیده به ریل آیکونی ادمین — فقط دسکتاپ، روی مسیر گزارش‌ها.
 * از زیر هدر اپ (`top-16`) شروع می‌شود؛ هر تم گروه باز/بسته سایدبار.
 */
export function AdminReportsSecondaryRail() {
  const pathname = usePathname();
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

  if (!isAdminReportsPath(pathname)) return null;

  return (
    <aside
      data-slot="kv-admin-reports-secondary-rail"
      aria-label="فهرست گزارش‌ها"
      className={cn(
        'fixed top-16 bottom-0 z-20 hidden flex-col border-e border-t border-kv-border/80 bg-kv-surface lg:flex',
        kvShellAdminReportsSecondaryRailOffsetClassName,
        kvShellAdminReportsSecondaryRailWidthClassName,
        kvShellAdminRailWidthMotionClassName
      )}
    >
      <nav
        className={cn(
          kvScrollAreaClassName,
          'flex min-h-0 flex-1 flex-col gap-kv-inline overflow-y-auto p-kv-inline pt-kv-stack pb-kv-page'
        )}
        aria-label="فهرست گزارش‌ها"
      >
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
      </nav>
    </aside>
  );
}

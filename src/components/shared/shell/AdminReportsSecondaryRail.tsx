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
import { useOrgReportAccess } from '@/features/karvita/reports/hooks/useOrgReportAccess';
import { adminReportsMenuGroupsFromMe } from '@/features/karvita/reports/lib/admin-report-access';
import { isAdminReportsPath } from '@/features/karvita/reports/lib/report-path';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/useUserStore';

/**
 * ریل دوم چسبیده به ریل آیکونی ادمین — فقط دسکتاپ، روی مسیر گزارش‌ها.
 * منو فقط از `GET /reports/access/me` ساخته می‌شود (active باز، inactive غیرفعال، غایب مخفی).
 */
export function AdminReportsSecondaryRail() {
  const pathname = usePathname();
  const role = useUserStore((state) => state.activeUser?.role);
  const { grantedSlugs, inactiveSlugs } = useOrgReportAccess();

  const groups = useMemo(
    () =>
      adminReportsMenuGroupsFromMe(grantedSlugs, inactiveSlugs, role) ?? [],
    [grantedSlugs, inactiveSlugs, role]
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

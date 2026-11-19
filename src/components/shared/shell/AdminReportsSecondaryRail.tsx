'use client';

import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { kvScrollAreaClassName } from '@/components/shared/KvScrollArea';
import { SidebarNavGroup } from '@/components/shared/shell/SidebarNavGroup';
import {
  kvShellAdminRailMotionClassName,
  kvShellAdminRailWidthMotionClassName,
  kvShellAdminReportsSecondaryRailCollapsedWidthClassName,
  kvShellAdminReportsSecondaryRailWidthClassName,
} from '@/components/shared/shell/shellChrome';
import { useOrgReportAccess } from '@/features/karvita/reports/hooks/useOrgReportAccess';
import { adminReportsMenuGroupsFromMe } from '@/features/karvita/reports/lib/admin-report-access';
import { isAdminReportsPath } from '@/features/karvita/reports/lib/report-path';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/useUserStore';
import { faIcons } from '@/utils/iconMap';

/**
 * ریل دوم کنار محتوای گزارش ادمین — فقط دسکتاپ، زیر هدر ثابت می‌ماند (با اسکرول حرکت نمی‌کند).
 * منو فقط از `GET /reports/access/me` ساخته می‌شود (active باز، inactive غیرفعال، غایب مخفی).
 * با دکمهٔ لبهٔ ریل جمع/باز می‌شود (جمع‌شده: همان حالت آیکونی ریل اصلی؛ لیبل‌ها مخفی، آیکن گروه‌ها می‌مانند).
 */
export function AdminReportsSecondaryRail() {
  const pathname = usePathname();
  const role = useUserStore((state) => state.activeUser?.role);
  const { grantedSlugs, inactiveSlugs } = useOrgReportAccess();
  const [isOpen, setIsOpen] = useState(true);
  const isCollapsed = !isOpen;

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
        'sticky top-16 z-20 hidden h-[calc(100dvh-4rem)] shrink-0 self-start lg:block',
        isOpen
          ? kvShellAdminReportsSecondaryRailWidthClassName
          : kvShellAdminReportsSecondaryRailCollapsedWidthClassName,
        kvShellAdminRailWidthMotionClassName
      )}
    >
      <div
        className={cn(
          'flex h-full w-full flex-col overflow-hidden border-e border-kv-border/80 bg-kv-surface'
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
              isCollapsed={isCollapsed}
              locked={false}
              onNavigate={() => undefined}
              textSize="legible"
              defaultOpenWhenActive
              onExpandFromCollapsed={() => setIsOpen(true)}
            />
          ))}
        </nav>
      </div>

      <KvButton
        type="button"
        color="neutral"
        appearance="ghost"
        size="sm"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={
          isOpen ? 'جمع کردن فهرست گزارش‌ها' : 'باز کردن فهرست گزارش‌ها'
        }
        className="absolute -inset-e-2.5 top-3 z-30 flex size-6 min-h-0 rounded-kv-control border border-kv-border/80 bg-kv-surface p-0 text-kv-text-subtle shadow-kv-soft hover:border-kv-brand hover:text-kv-brand"
        icon={
          <FaIcon
            icon={faIcons.chevronLeft}
            size="xs"
            className={cn(
              'transition-transform',
              kvShellAdminRailMotionClassName,
              isOpen
                ? 'rotate-0 rtl:rotate-180'
                : 'rotate-180 rtl:rotate-0'
            )}
          />
        }
      />
    </aside>
  );
}

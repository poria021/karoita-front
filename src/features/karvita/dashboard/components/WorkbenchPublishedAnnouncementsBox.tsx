'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, type CSSProperties } from 'react';

import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import {
  KvTable,
  KvTableBody,
  KvTableCell,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import { KvTypography } from '@/components/shared/KvTypography';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import {
  pickLatestPublishedAnnouncements,
} from '@/services/bulletins/bulletin-rules';
import { BulletinsService } from '@/services/bulletins.service';
import { RouteService } from '@/services/route.service';
import type { UserRole } from '@/types/auth';
import type { Bulletin } from '@/types/bulletins';
import { formatJalaliSlashDisplay } from '@/utils/formatJalaliDate';
import { toPersianDigits } from '@/utils/persianDigits';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';
import { isForbiddenError } from '@/services/api-error';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchPublishedAnnouncementsBoxProps = {
  /** نقش کاربر جاری — کلید کش مشترک با صفحهٔ مدیریت اطلاعیه‌ها. */
  role: UserRole;
  className?: string;
  style?: CSSProperties;
};

function audienceLabels(roles: readonly UserRole[]): string[] {
  return roles.map((role) => getRoleStrategy(role).label);
}

/** تعدادِ پنل‌های مخاطب — با هاور، فهرست کامل پنل‌ها دیده می‌شود. */
function AudiencePanelCount({ roles }: { roles: readonly UserRole[] }) {
  const labels = audienceLabels(roles);
  if (labels.length === 0) {
    return <span className="text-xs text-kv-text-muted">—</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className="inline-flex shrink-0 cursor-default items-center gap-1 rounded-full bg-kv-brand-soft px-2 py-0.5 text-[11px] font-bold tabular-nums text-kv-brand-soft-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring/30"
        >
          {toPersianDigits(labels.length)} پنل
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-56 text-start">
        {labels.join('، ')}
      </TooltipContent>
    </Tooltip>
  );
}

function AnnouncementTableRow({ row }: { row: Bulletin }) {
  const date = formatJalaliSlashDisplay(new Date(row.createdAt));

  return (
    <KvTableRow>
      <KvTableCell emphasis className="max-w-0">
        <span className="block truncate" title={row.title}>
          {row.title}
        </span>
      </KvTableCell>
      <KvTableCell align="center">
        <AudiencePanelCount roles={row.audienceRoles} />
      </KvTableCell>
      <KvTableCell align="end" mono className="text-kv-text-subtle">
        {date}
      </KvTableCell>
    </KvTableRow>
  );
}

/**
 * آخرین اطلاعیه‌هایی که ستاد (مدیر ارشد / دستیار) برای پنل‌های دیگر منتشر کرده:
 * عنوان + تعداد پنل‌های مخاطب (با هاور، فهرست کامل پنل‌ها) + تاریخ.
 */
export function WorkbenchPublishedAnnouncementsBox({
  role,
  className,
  style,
}: WorkbenchPublishedAnnouncementsBoxProps) {
  const query = useQuery({
    queryKey: [...DASHBOARD_QUERY.bulletinsManaged, role],
    queryFn: () => BulletinsService.listManagedBulletins(),
    staleTime: QUERY_STALE_MS.list,
    retry: false,
  });

  const items = useMemo(
    () => pickLatestPublishedAnnouncements(query.data ?? []),
    [query.data]
  );

  const isEmpty = query.isError || (!query.isLoading && items.length === 0);

  return (
    <section
      aria-labelledby="dashboard-published-announcements-title"
      style={style}
      className={cn(
        'relative flex h-full min-h-[14rem] min-w-0 flex-col gap-kv-pair overflow-hidden rounded-kv-shell border px-kv-group py-kv-group',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-kv-inline">
        <div className="flex min-w-0 flex-1 flex-col">
          <KvTypography
            variant="subtitle"
            as="h3"
            id="dashboard-published-announcements-title"
            className="min-w-0 truncate"
          >
            آخرین اطلاعیه‌های منتشرشده
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            با هاور روی «پنل‌های مخاطب»، فهرست کامل پنل‌ها دیده می‌شود
          </KvTypography>
        </div>
        <KvButton
          asChild
          color="cta"
          appearance="text"
          size="xs"
          className="shrink-0 text-[11px] font-bold"
        >
          <Link href={RouteService.karvita.announcements('announcement')} prefetch>
            مدیریت
          </Link>
        </KvButton>
      </header>

      {query.isError ? (
        <WorkbenchUnavailableNote forbidden={isForbiddenError(query.error)} />
      ) : query.isLoading ? (
        <div
          role="status"
          aria-label="در حال بارگذاری اطلاعیه‌های منتشرشده"
          className="min-h-0 flex-1 animate-pulse rounded-kv-control bg-kv-surface-muted"
        />
      ) : items.length === 0 ? (
        <KvEmptyState
          title="هنوز اطلاعیه‌ای برای پنل‌ها منتشر نشده است."
          className="min-h-0 py-1"
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto rounded-kv-control border border-kv-border-muted [scrollbar-width:thin]">
          <KvTable
            scrollable={false}
            aria-label="آخرین اطلاعیه‌های منتشرشده"
            className="min-w-0 table-fixed"
          >
            <KvTableHeader>
              <KvTableRow>
                <KvTableHead>عنوان</KvTableHead>
                <KvTableHead align="center" className="w-28">
                  پنل‌های مخاطب
                </KvTableHead>
                <KvTableHead align="end" className="w-32">
                  تاریخ انتشار
                </KvTableHead>
              </KvTableRow>
            </KvTableHeader>
            <KvTableBody>
              {items.map((row) => (
                <AnnouncementTableRow key={row.id} row={row} />
              ))}
            </KvTableBody>
          </KvTable>
        </div>
      )}
    </section>
  );
}

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
import { getRoleStrategy } from '@/utils/RoleStrategyMap';
import { isForbiddenError } from '@/services/api-error';
import { WorkbenchBoxBusy } from './WorkbenchBoxBusy';
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

/** نام پنل‌های مخاطب — همان استایل بج، بدون تولتیپ هاور. */
function AudiencePanelLabels({ roles }: { roles: readonly UserRole[] }) {
  const labels = audienceLabels(roles);
  if (labels.length === 0) {
    return <span className="text-xs text-kv-text-muted">—</span>;
  }

  const text = labels.join('، ');
  return (
    <span className="inline-flex max-w-full shrink-0 items-center rounded-full bg-kv-brand-soft px-2 py-0.5 text-[11px] font-bold text-kv-brand-soft-fg">
      <span className="truncate">{text}</span>
    </span>
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
        <AudiencePanelLabels roles={row.audienceRoles} />
      </KvTableCell>
      <KvTableCell align="end" mono className="text-kv-text-subtle">
        {date}
      </KvTableCell>
    </KvTableRow>
  );
}

/**
 * آخرین اطلاعیه‌هایی که این پنل برای مخاطبانش منتشر کرده
 * (مدیر ارشد / دستیار / سازمان مرکزی): عنوان + نام پنل‌های مخاطب + تاریخ.
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
            عنوان، پنل مخاطب و تاریخ انتشار
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
        <WorkbenchBoxBusy
          label="در حال بارگذاری اطلاعیه‌های منتشرشده"
          className="min-h-0"
        />
      ) : items.length === 0 ? (
        <KvEmptyState
          title="هنوز اطلاعیه‌ای برای پنل‌ها منتشر نشده است."
          className="min-h-0 py-1"
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto rounded-kv-control border border-kv-border-muted [direction:ltr] [scrollbar-width:thin]">
          <div dir="rtl" className="[direction:rtl]">
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
        </div>
      )}
    </section>
  );
}

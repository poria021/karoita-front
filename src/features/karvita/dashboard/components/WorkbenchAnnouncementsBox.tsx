'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { BulletinCard } from '@/features/karvita/bulletins/components/BulletinCard';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import {
  canPublishAnnouncements,
  canReceiveBulletins,
  DASHBOARD_ANNOUNCEMENTS_PREVIEW_LIMIT,
  type DashboardBulletinSource,
} from '@/services/bulletins/bulletin-rules';
import { RouteService } from '@/services/route.service';
import type { UserRole } from '@/types/auth';
import type { Bulletin } from '@/types/bulletins';

import { WorkbenchBoxBusy } from './WorkbenchBoxBusy';
import { workbenchErrorText } from './WorkbenchUnavailableNote';

export type WorkbenchAnnouncementsBoxProps = {
  announcements: Bulletin[];
  isLoading?: boolean;
  isError?: boolean;
  /** ۴۰۳: نقش کاربر به این گزارش مجوز ندارد. */
  isForbidden?: boolean;
  source: DashboardBulletinSource;
  /**
   * میان‌بر «نوشتن اطلاعیه».
   * دانشجو / مهارت‌آموز: false — بقیهٔ نقش‌های ناشر: true.
   */
  canPublish: boolean;
  /** میان‌بر «مشاهده همه» به تب دریافتی‌ها. */
  canReceive: boolean;
  className?: string;
  style?: CSSProperties;
};

/** پرچم‌های اکشن سربرگ از نقش پنل. */
export function workbenchAnnouncementActionsFor(role: UserRole): {
  canPublish: boolean;
  canReceive: boolean;
} {
  return {
    canPublish: canPublishAnnouncements(role),
    canReceive: canReceiveBulletins(role),
  };
}

function AnnouncementActions({
  canReceive,
  canPublish,
}: {
  canReceive: boolean;
  canPublish: boolean;
}) {
  if (!canReceive && !canPublish) return null;

  return (
    <div className="flex shrink-0 items-center gap-kv-micro">
      {canReceive ? (
        <KvButton
          asChild
          color="cta"
          appearance="text"
          size="xs"
          className="text-[11px] font-bold"
        >
          <Link href={RouteService.karvita.announcements('received')}>
            مشاهده همه
          </Link>
        </KvButton>
      ) : null}
      {canReceive && canPublish ? (
        <span
          aria-hidden
          className="text-[11px] font-medium text-kv-border-strong"
        >
          |
        </span>
      ) : null}
      {canPublish ? (
        <KvButton
          asChild
          color="cta"
          appearance="text"
          size="xs"
          className="text-[11px] font-bold"
        >
          <Link href={RouteService.karvita.announcements('announcement')}>
            نوشتن اطلاعیه
          </Link>
        </KvButton>
      ) : null}
    </div>
  );
}

function AnnouncementsBody({
  isLoading,
  isError,
  isForbidden,
  isPublished,
  preview,
}: {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  isPublished: boolean;
  preview: Bulletin[];
}) {
  if (isLoading) {
    return (
      <WorkbenchBoxBusy label="در حال بارگذاری اطلاعیه‌ها" className="min-h-0" />
    );
  }

  if (isError) {
    return (
      <KvEmptyState
        title={workbenchErrorText(
          isForbidden,
          'اطلاعیه‌ها فعلاً در دسترس نیست؛ کمی بعد دوباره تلاش کنید.'
        )}
        className="min-h-0 py-kv-pair"
      />
    );
  }

  if (preview.length === 0) {
    return (
      <KvEmptyState
        title={
          isPublished
            ? 'هنوز اطلاعیه‌ای برای زیرمجموعه‌ها منتشر نکرده‌اید.'
            : 'فعلاً اطلاعیه‌ای برای شما منتشر نشده است.'
        }
        className="min-h-0 py-kv-pair"
      />
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto [direction:ltr] [scrollbar-width:thin]">
      <ul
        dir="rtl"
        className="flex list-none flex-col divide-y divide-kv-border-muted [direction:rtl]"
      >
        {preview.map((item) => (
          <li key={item.id}>
            <BulletinCard bulletin={item} showPanelBadge={!isPublished} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * باکس «اطلاعیه‌ها»ی مشترک همهٔ صفحات میز کار.
 * دکمهٔ نوشتن فقط وقتی `canPublish` باشد (دانشجو/مهارت‌آموز ندارند).
 */
export function WorkbenchAnnouncementsBox({
  announcements,
  isLoading = false,
  isError = false,
  isForbidden = false,
  source,
  canPublish,
  canReceive,
  className,
  style,
}: WorkbenchAnnouncementsBoxProps) {
  const isPublished = source === 'published';
  const preview = isError
    ? []
    : announcements.slice(0, DASHBOARD_ANNOUNCEMENTS_PREVIEW_LIMIT);
  const isEmpty = !isLoading && (isError || preview.length === 0);

  return (
    <section
      aria-labelledby="dashboard-announcements-title"
      style={style}
      className={cn(
        'flex min-h-0 flex-col gap-kv-group overflow-hidden rounded-kv-shell border p-kv-group',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-kv-inline">
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-kv-pair">
          <KvTypography
            variant="subtitle"
            as="h3"
            id="dashboard-announcements-title"
          >
            {isPublished ? 'اطلاعیه‌های منتشرشدهٔ شما' : 'اطلاعیه‌ها'}
          </KvTypography>
        </div>
        <AnnouncementActions
          canReceive={canReceive}
          canPublish={canPublish}
        />
      </header>
      <AnnouncementsBody
        isLoading={isLoading}
        isError={isError}
        isForbidden={isForbidden}
        isPublished={isPublished}
        preview={preview}
      />
    </section>
  );
}

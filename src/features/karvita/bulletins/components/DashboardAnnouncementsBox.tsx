'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import {
  DASHBOARD_ANNOUNCEMENTS_PREVIEW_LIMIT,
  type DashboardBulletinSource,
} from '@/services/bulletins/bulletin-rules';
import { RouteService } from '@/services/route.service';
import type { Bulletin } from '@/types/bulletins';
import { toPersianDigits } from '@/utils/persianDigits';

import { BulletinCard } from './BulletinCard';

type DashboardAnnouncementsBoxProps = {
  announcements: Bulletin[];
  isLoading: boolean;
  source: DashboardBulletinSource;
  /** پنل زیرمجموعه دارد → میان‌بر «مدیریت» در سربرگ. */
  canPublish: boolean;
  /** گیرندۀ اطلاعیه → «مشاهده همه» به تب دریافتی‌ها (مدیر ارشد نه). */
  canReceive: boolean;
  className?: string;
  style?: CSSProperties;
};

function CountHint({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <KvTypography
      variant="caption"
      tone="muted"
      as="span"
      className="font-medium"
    >
      ({toPersianDigits(String(count))})
    </KvTypography>
  );
}

function AnnouncementsList({
  isLoading,
  isPublished,
  preview,
}: {
  isLoading: boolean;
  isPublished: boolean;
  preview: Bulletin[];
}) {
  if (isLoading) {
    return (
      <KvTypography variant="caption" tone="muted" as="p">
        در حال بارگذاری اطلاعیه‌ها…
      </KvTypography>
    );
  }
  if (preview.length === 0) {
    return (
      <KvTypography variant="body" tone="muted" as="p">
        {isPublished
          ? 'هنوز اطلاعیه‌ای برای زیرمجموعه‌ها منتشر نکرده‌اید.'
          : 'فعلاً اطلاعیه‌ای برای شما منتشر نشده است.'}
      </KvTypography>
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

function AnnouncementActions({
  canReceive,
  canPublish,
}: {
  canReceive: boolean;
  canPublish: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-kv-micro">
      {canReceive ? (
        <KvButton asChild color="neutral" appearance="text" size="xs">
          <Link href={RouteService.karvita.announcements('received')}>
            مشاهده همه
          </Link>
        </KvButton>
      ) : null}
      {canPublish ? (
        <KvButton asChild color="neutral" appearance="text" size="xs">
          <Link href={RouteService.karvita.announcements('announcement')}>
            مدیریت
          </Link>
        </KvButton>
      ) : null}
    </div>
  );
}

/** باکس «اطلاعیه‌ها»ی میز کار. */
export function DashboardAnnouncementsBox({
  announcements,
  isLoading,
  source,
  canPublish,
  canReceive,
  className,
  style,
}: DashboardAnnouncementsBoxProps) {
  const isPublished = source === 'published';
  const preview = announcements.slice(0, DASHBOARD_ANNOUNCEMENTS_PREVIEW_LIMIT);

  return (
    <section
      aria-labelledby="dashboard-announcements-title"
      style={style}
      className={cn(
        'flex min-h-0 flex-col gap-kv-group overflow-hidden rounded-kv-shell border border-kv-border/70 bg-kv-surface p-kv-group shadow-kv-soft',
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
          <CountHint count={preview.length} />
        </div>
        <AnnouncementActions
          canReceive={canReceive}
          canPublish={canPublish}
        />
      </header>
      <AnnouncementsList
        isLoading={isLoading}
        isPublished={isPublished}
        preview={preview}
      />
    </section>
  );
}

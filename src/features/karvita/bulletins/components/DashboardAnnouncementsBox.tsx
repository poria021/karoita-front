'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import {
  DASHBOARD_ANNOUNCEMENTS_PREVIEW_LIMIT,
  type DashboardBulletinSource,
} from '@/services/bulletins/bulletin-rules';
import { RouteService } from '@/services/route.service';
import type { Bulletin } from '@/types/bulletins';
import { faIcons } from '@/utils/iconMap';
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

/** باکس «اطلاعیه‌ها»ی میز کار — اطلاعیهٔ پنل‌های بالادست با بج نام پنل منتشرکننده. */
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
      <header className="flex shrink-0 items-center gap-kv-inline border-b border-kv-border-muted pb-kv-group">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand-soft-fg">
          <FaIcon icon={faIcons.bell} size="sm" />
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-kv-pair">
          <KvTypography
            variant="subtitle"
            as="h3"
            id="dashboard-announcements-title"
          >
            {isPublished ? 'اطلاعیه‌های منتشرشدهٔ شما' : 'اطلاعیه‌ها'}
          </KvTypography>
          {preview.length > 0 ? (
            <KvTypography
              variant="caption"
              tone="muted"
              as="span"
              className="font-medium"
            >
              ({toPersianDigits(String(preview.length))})
            </KvTypography>
          ) : null}
        </div>
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
      </header>

      {isLoading ? (
        <KvTypography variant="caption" tone="muted" as="p">
          در حال بارگذاری اطلاعیه‌ها…
        </KvTypography>
      ) : preview.length === 0 ? (
        <KvTypography variant="body" tone="muted" as="p">
          {isPublished
            ? 'هنوز اطلاعیه‌ای برای زیرمجموعه‌ها منتشر نکرده‌اید.'
            : 'فعلاً اطلاعیه‌ای برای شما منتشر نشده است.'}
        </KvTypography>
      ) : (
        <ul className="flex min-h-0 flex-1 list-none flex-col divide-y divide-kv-border-muted overflow-y-auto">
          {preview.map((item) => (
            <li key={item.id}>
              <BulletinCard
                bulletin={item}
                showPanelBadge={!isPublished}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

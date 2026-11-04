'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import type { DashboardBulletinSource } from '@/services/bulletins/bulletin-rules';
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
  className?: string;
  style?: CSSProperties;
};

/** باکس «اطلاعیه‌ها»ی میز کار — اطلاعیهٔ پنل‌های بالادست با بج نام پنل منتشرکننده. */
export function DashboardAnnouncementsBox({
  announcements,
  isLoading,
  source,
  canPublish,
  className,
  style,
}: DashboardAnnouncementsBoxProps) {
  const isPublished = source === 'published';

  return (
    <section
      aria-labelledby="dashboard-announcements-title"
      style={style}
      className={cn(
        'flex min-h-0 flex-col gap-kv-group overflow-hidden rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group shadow-kv-raised',
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-kv-inline">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand">
          <FaIcon icon={faIcons.bell} size="sm" />
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-kv-pair">
          <KvTypography variant="subtitle" as="h3" id="dashboard-announcements-title">
            {isPublished ? 'اطلاعیه‌های منتشرشدهٔ شما' : 'اطلاعیه‌ها'}
          </KvTypography>
          {announcements.length > 0 ? (
            <KvTypography variant="caption" tone="muted" as="span">
              ({toPersianDigits(String(announcements.length))})
            </KvTypography>
          ) : null}
        </div>
        {canPublish ? (
          <KvButton asChild color="neutral" appearance="text" size="xs">
            <Link href={RouteService.karvita.announcements('announcement')}>
              مدیریت
            </Link>
          </KvButton>
        ) : null}
      </header>

      {isLoading ? (
        <KvTypography variant="caption" tone="muted" as="p">
          در حال بارگذاری اطلاعیه‌ها…
        </KvTypography>
      ) : announcements.length === 0 ? (
        <KvTypography variant="body" tone="muted" as="p">
          {isPublished
            ? 'هنوز اطلاعیه‌ای برای زیرمجموعه‌ها منتشر نکرده‌اید.'
            : 'فعلاً اطلاعیه‌ای برای شما منتشر نشده است.'}
        </KvTypography>
      ) : (
        <ul className="flex min-h-0 flex-1 list-none flex-col overflow-y-auto">
          {announcements.map((item) => (
            <li key={item.id}>
              <BulletinCard bulletin={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

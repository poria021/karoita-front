'use client';

import type { ReactNode } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import type { Bulletin } from '@/types/bulletins';
import { formatNotificationTime } from '@/utils/formatJalaliDate';
import { faIcons } from '@/utils/iconMap';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

type BulletinCardProps = {
  bulletin: Bulletin;
  /** دکمه‌های ویرایش/حذف در صفحهٔ مدیریت. */
  actions?: ReactNode;
  /** زیر متن — مثلاً لیست مخاطبان در صفحهٔ مدیریت. */
  footer?: ReactNode;
};

/** بج نام پنل منتشرکننده — همان لیبل نقش در سایدبار. */
export function BulletinPanelBadge({ bulletin }: { bulletin: Bulletin }) {
  const isAd = bulletin.kind === 'advertisement';
  return (
    <span
      className={
        isAd
          ? 'inline-flex shrink-0 items-center gap-1 rounded-full bg-kv-warning-soft px-2 py-0.5 text-xs font-bold text-kv-warning-soft-fg'
          : 'inline-flex shrink-0 items-center gap-1 rounded-full bg-kv-brand-soft px-2 py-0.5 text-xs font-bold text-kv-brand-soft-fg'
      }
    >
      <FaIcon icon={isAd ? faIcons.bullhorn : faIcons.bell} size="xs" />
      {getRoleStrategy(bulletin.authorRole).label}
    </span>
  );
}

export function BulletinCard({ bulletin, actions, footer }: BulletinCardProps) {
  return (
    <article className="flex flex-col gap-kv-pair rounded-kv-control border border-kv-border bg-kv-surface p-kv-group text-start">
      {bulletin.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL در mock؛ next/image اعمال نمی‌شود
        <img
          src={bulletin.imageUrl}
          alt={bulletin.title}
          loading="lazy"
          className="aspect-[16/7] w-full rounded-kv-control bg-kv-surface-muted object-cover"
        />
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-kv-pair">
        <div className="flex min-w-0 flex-wrap items-center gap-kv-pair">
          <BulletinPanelBadge bulletin={bulletin} />
          <KvTypography variant="caption" tone="muted" as="span">
            {formatNotificationTime(bulletin.createdAt)}
          </KvTypography>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-1">{actions}</div>
        ) : null}
      </div>
      <KvTypography variant="subtitle" as="h4">
        {bulletin.title}
      </KvTypography>
      {bulletin.body ? (
        <KvTypography variant="body" tone="muted" as="p">
          <span className="whitespace-pre-line">{bulletin.body}</span>
        </KvTypography>
      ) : null}
      {bulletin.linkUrl ? (
        <a
          href={bulletin.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1 text-xs font-bold text-kv-brand hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20"
        >
          اطلاعات بیشتر
          <FaIcon icon={faIcons.arrowUpRightFromSquare} size="xs" />
        </a>
      ) : null}
      {footer}
    </article>
  );
}

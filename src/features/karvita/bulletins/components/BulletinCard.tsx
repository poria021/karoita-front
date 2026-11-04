'use client';

import { useId, useState, type ReactNode } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
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
  className?: string;
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

/**
 * ردیف اطلاعیهٔ میز کار: بج + تاریخ در یک سطر، عنوان زیرش، توضیحات با دکمهٔ کشویی (پیش‌فرض بسته).
 * بدون باکس بردردار — فقط جداکنندهٔ زیر هر پیام.
 */
export function BulletinCard({
  bulletin,
  actions,
  footer,
  className,
}: BulletinCardProps) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const hasDetails = Boolean(bulletin.body || bulletin.linkUrl);

  return (
    <article
      className={cn(
        'flex flex-col gap-kv-pair border-b border-kv-border py-kv-group text-start last:border-b-0',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-kv-pair">
        <div className="flex min-w-0 flex-wrap items-center gap-kv-pair">
          <BulletinPanelBadge bulletin={bulletin} />
          {actions ? (
            <div className="flex shrink-0 items-center gap-1">{actions}</div>
          ) : null}
        </div>
        <KvTypography variant="caption" tone="muted" as="span" className="shrink-0">
          {formatNotificationTime(bulletin.createdAt)}
        </KvTypography>
      </div>

      <KvTypography variant="subtitle" as="h4">
        {bulletin.title}
      </KvTypography>

      {hasDetails ? (
        <div className="flex flex-col gap-kv-pair">
          <KvButton
            type="button"
            color="neutral"
            appearance="text"
            size="xs"
            className="self-start"
            aria-expanded={open}
            aria-controls={bodyId}
            iconPosition="end"
            icon={
              <FaIcon
                icon={faIcons.chevronDown}
                size="xs"
                className={cn(
                  'transition-transform motion-reduce:transition-none',
                  open && 'rotate-180'
                )}
              />
            }
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? 'بستن توضیحات' : 'مشاهده توضیحات'}
          </KvButton>

          {open ? (
            <div id={bodyId} className="flex flex-col gap-kv-pair">
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
            </div>
          ) : null}
        </div>
      ) : null}

      {footer}
    </article>
  );
}

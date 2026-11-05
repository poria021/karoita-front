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
  /** بج نقش منتشرکننده — برای دریافتی‌ها روشن؛ برای لیست خودِ ناشر خاموش. */
  showPanelBadge?: boolean;
  className?: string;
};

/** بج نام پنل منتشرکننده — همان لیبل نقش در سایدبار. */
export function BulletinPanelBadge({ bulletin }: { bulletin: Bulletin }) {
  const isAd = bulletin.kind === 'advertisement';
  return (
    <span
      className={
        isAd
          ? 'inline-flex shrink-0 items-center gap-1 rounded-kv-control bg-kv-warning-soft px-2 py-0.5 text-xs font-bold text-kv-warning-soft-fg'
          : 'inline-flex shrink-0 items-center gap-1 rounded-kv-control bg-kv-brand-soft px-2 py-0.5 text-xs font-bold text-kv-brand-soft-fg'
      }
    >
      <FaIcon icon={isAd ? faIcons.bullhorn : faIcons.bell} size="xs" />
      {getRoleStrategy(bulletin.authorRole).label}
    </span>
  );
}

/**
 * ردیف اطلاعیه — عنوان راست، تاریخ/دکمهٔ توضیحات چپ، متن کشویی زیر عنوان.
 */
export function BulletinCard({
  bulletin,
  actions,
  footer,
  showPanelBadge = true,
  className,
}: BulletinCardProps) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const hasDetails = Boolean(bulletin.body || bulletin.linkUrl);

  return (
    <article
      className={cn(
        'flex w-full flex-col gap-kv-micro py-kv-group text-start',
        className
      )}
    >
      <div className="flex w-full items-start gap-kv-inline">
        <div className="min-w-0 flex-1 break-words pe-kv-pair">
          {actions ? (
            <div className="mb-kv-micro flex shrink-0 items-center gap-1">
              {actions}
            </div>
          ) : null}
          {showPanelBadge ? (
            <div className="mb-kv-micro flex flex-wrap items-center gap-kv-pair">
              <BulletinPanelBadge bulletin={bulletin} />
            </div>
          ) : null}
          <KvTypography
            variant="caption"
            weight="bold"
            as="h4"
            className="block text-kv-text-secondary"
          >
            {bulletin.title}
          </KvTypography>
          {hasDetails && open ? (
            <div id={bodyId} className="mt-kv-pair flex flex-col gap-kv-micro">
              {bulletin.body ? (
                <KvTypography
                  variant="caption"
                  tone="muted"
                  as="p"
                  className="block leading-relaxed"
                >
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
          {footer ? <div className="mt-kv-micro">{footer}</div> : null}
        </div>

        {hasDetails ? (
          <KvButton
            type="button"
            color="neutral"
            appearance="text"
            size="xs"
            className="shrink-0"
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
            {open ? 'بستن' : 'توضیحات'}
          </KvButton>
        ) : (
          <span
            className="origin-top-end shrink-0 scale-[0.85] whitespace-nowrap opacity-70"
            dir="rtl"
          >
            <KvTypography variant="overline" tone="disabled" as="span">
              {formatNotificationTime(bulletin.createdAt)}
            </KvTypography>
          </span>
        )}
      </div>
    </article>
  );
}

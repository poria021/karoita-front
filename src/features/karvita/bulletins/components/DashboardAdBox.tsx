'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';
import { RouteService } from '@/services/route.service';
import type { Bulletin } from '@/types/bulletins';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { BulletinPanelBadge } from './BulletinCard';

const SLIDE_DURATION = 6000;

type DashboardAdBoxProps = {
  ads: Bulletin[];
  isLoading: boolean;
  /** ستاد: پیش‌نمایش تبلیغ‌های خودش + میان‌بر انتشار. */
  isPublisher: boolean;
};

const BOX_CLASS =
  'relative aspect-square w-full overflow-hidden rounded-kv-panel border border-kv-border bg-kv-surface-muted shadow-kv-raised';

/**
 * باکس ۱×۱ تبلیغات ستاد — چند تبلیغ به‌صورت چرخشی در همان قاب مربعی.
 * با hover/فوکوس یا ترجیح کاهش حرکت، پیشروی خودکار متوقف می‌شود.
 * تبلیغ بدون تصویر، توضیحاتش را داخل قاب نشان می‌دهد.
 */
export function DashboardAdBox({ ads, isLoading, isPublisher }: DashboardAdBoxProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const count = ads.length;
  const active = count === 0 ? 0 : Math.min(current, count - 1);

  useEffect(() => {
    if (count <= 1 || paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % count);
    }, SLIDE_DURATION);
    return () => window.clearInterval(timer);
  }, [count, paused, reducedMotion]);

  if (isLoading) {
    return <div className={cn(BOX_CLASS, 'animate-pulse')} aria-hidden />;
  }

  if (count === 0) {
    return (
      <section
        aria-label="تبلیغات"
        className={cn(
          BOX_CLASS,
          'flex flex-col items-center justify-center gap-kv-group border-dashed p-kv-group text-center shadow-none'
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-kv-warning-soft text-kv-warning-soft-fg">
          <FaIcon icon={faIcons.bullhorn} />
        </span>
        <KvTypography variant="body" tone="muted" as="p">
          {isPublisher ? 'هنوز تبلیغی منتشر نکرده‌اید.' : 'فعلاً تبلیغی برای نمایش نیست.'}
        </KvTypography>
        {isPublisher ? (
          <KvButton asChild appearance="secondary" size="sm">
            <Link href={RouteService.karvita.announcements('advertisement')}>
              انتشار تبلیغ
            </Link>
          </KvButton>
        ) : null}
      </section>
    );
  }

  const go = (delta: number) => setCurrent((active + delta + count) % count);
  const shown = ads[active];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="تبلیغات"
      className={BOX_CLASS}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      {ads.map((ad, index) => {
        const isActive = index === active;
        return (
          <div
            key={ad.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${toPersianDigits(String(index + 1))} از ${toPersianDigits(String(count))}`}
            aria-hidden={!isActive}
            inert={!isActive}
            className={cn(
              'absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none',
              isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
          >
            {ad.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL در mock؛ next/image اعمال نمی‌شود
              <img
                src={ad.imageUrl}
                alt={ad.title}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="size-full object-cover"
              />
            ) : ad.body ? (
              <div className="flex size-full items-center justify-center px-kv-group pb-24 pt-12 text-center">
                <KvTypography variant="body" tone="muted" as="p">
                  <span className="line-clamp-6 whitespace-pre-line">{ad.body}</span>
                </KvTypography>
              </div>
            ) : (
              <div className="flex size-full items-center justify-center text-kv-empty-icon">
                <FaIcon icon={faIcons.image} size="xl" />
              </div>
            )}
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex p-kv-pair">
        <BulletinPanelBadge bulletin={shown} />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end gap-kv-pair border-t border-kv-border bg-kv-surface/95 p-kv-group">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <KvTypography variant="subtitle" as="h3">
            <span className="line-clamp-2">{shown.title}</span>
          </KvTypography>
          {shown.imageUrl && shown.body ? (
            <KvTypography variant="caption" tone="muted" as="p">
              <span className="line-clamp-2">{shown.body}</span>
            </KvTypography>
          ) : null}
          {shown.linkUrl ? (
            <a
              href={shown.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1 text-xs font-bold text-kv-brand hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20"
            >
              اطلاعات بیشتر
              <FaIcon icon={faIcons.arrowUpRightFromSquare} size="xs" />
            </a>
          ) : null}
        </div>
        {count > 1 ? (
          <div className="flex shrink-0 items-center">
            <KvButton
              type="button"
              color="neutral"
              appearance="text"
              size="xs"
              aria-label="تبلیغ قبلی"
              icon={<FaIcon icon={faIcons.chevronRight} size="xs" />}
              onClick={() => go(-1)}
            />
            <KvTypography variant="caption" tone="muted" as="span">
              {toPersianDigits(String(active + 1))}/{toPersianDigits(String(count))}
            </KvTypography>
            <KvButton
              type="button"
              color="neutral"
              appearance="text"
              size="xs"
              aria-label="تبلیغ بعدی"
              icon={<FaIcon icon={faIcons.chevronLeft} size="xs" />}
              onClick={() => go(1)}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

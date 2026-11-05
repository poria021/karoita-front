'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';
import { BulletinsService } from '@/services/bulletins.service';
import { RouteService } from '@/services/route.service';
import type { Bulletin } from '@/types/bulletins';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

const SLIDE_DURATION = 6000;

/**
 * نسبت ثابت ۳:۴ داخل سلول ۳۰۰px دسکتاپ (≡ ۳۰۰×۴۰۰).
 * روی موبایل عرض سلول جمع می‌شود و نسبت حفظ می‌ماند.
 */
export const DASHBOARD_AD_ASPECT_CLASS = 'aspect-[3/4]';

function isExternalAdLink(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

type DashboardAdBoxProps = {
  ads: Bulletin[];
  isLoading: boolean;
  /** ستاد: پیش‌نمایش تبلیغ‌های خودش + میان‌بر انتشار. */
  isPublisher: boolean;
};

const BOX_CLASS = cn(
  'relative w-full overflow-hidden rounded-kv-shell border border-kv-border/70 bg-kv-surface-muted shadow-kv-soft',
  DASHBOARD_AD_ASPECT_CLASS
);

/**
 * باکس تبلیغ سایدبار — پر کردن سلول گرید با نسبت ثابت ۳:۴.
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
          'flex flex-col items-center justify-center gap-kv-pair border-dashed p-kv-group text-center shadow-none'
        )}
      >
        <span className="flex size-9 items-center justify-center rounded-kv-control bg-kv-warning-soft text-kv-warning-soft-fg">
          <FaIcon icon={faIcons.bullhorn} size="sm" />
        </span>
        <KvTypography variant="caption" tone="muted" as="p">
          {isPublisher ? 'هنوز تبلیغی منتشر نشده.' : 'تبلیغی برای نمایش نیست.'}
        </KvTypography>
        {isPublisher ? (
          <KvButton asChild appearance="secondary" size="xs">
            <Link href={RouteService.karvita.announcements('advertisement')}>
              انتشار تبلیغ
            </Link>
          </KvButton>
        ) : null}
      </section>
    );
  }

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
            ) : (
              <div className="flex size-full items-center justify-center bg-kv-surface-muted px-kv-group pb-20 text-center">
                <KvTypography variant="caption" tone="muted" as="p">
                  <span className="line-clamp-6 whitespace-pre-line">
                    {ad.body || ad.title}
                  </span>
                </KvTypography>
              </div>
            )}
          </div>
        );
      })}

      <span className="pointer-events-none absolute start-2 top-2 z-10 rounded-kv-tight bg-kv-canvas/90 px-1.5 py-0.5 text-[10px] font-bold text-kv-text-muted shadow-kv-soft">
        تبلیغ
      </span>

      {count > 1 ? (
        <div
          className="absolute end-2 top-2 z-10 flex gap-1"
          role="tablist"
          aria-label="انتخاب تبلیغ"
        >
          {ads.map((ad, index) => (
            <button
              key={ad.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`تبلیغ ${toPersianDigits(String(index + 1))}`}
              className={cn(
                'size-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-kv-ring/40',
                index === active
                  ? 'bg-kv-canvas shadow-kv-soft'
                  : 'bg-kv-canvas/45 hover:bg-kv-canvas/75'
              )}
              onClick={() => setCurrent(index)}
            />
          ))}
        </div>
      ) : null}

      {/* گرادیان پایین = بک‌گراند مین (canvas) در لایت و دارک */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex min-h-[20%] flex-col justify-end gap-1 bg-gradient-to-t from-kv-canvas via-kv-canvas/85 to-transparent px-2.5 pb-2.5 pt-10">
        <p className="line-clamp-2 text-sm font-bold leading-snug text-kv-text">
          {shown.title}
        </p>
        {shown.linkUrl ? (
          <a
            href={shown.linkUrl}
            {...(isExternalAdLink(shown.linkUrl)
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
            onClick={() => {
              void BulletinsService.recordAdvertisementClick(shown.id);
            }}
            className="inline-flex w-fit items-center gap-1 text-xs font-bold text-kv-text underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/30"
          >
            اطلاعات بیشتر
            <FaIcon icon={faIcons.arrowUpRightFromSquare} size="xs" />
          </a>
        ) : null}
      </div>
    </section>
  );
}

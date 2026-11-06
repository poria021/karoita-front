'use client';

import { useEffect, useId, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';
import { WORKBENCH_AD_ASPECT_CLASS } from '@/lib/workbench-grid';
import { BulletinsService } from '@/services/bulletins.service';
import type { Bulletin } from '@/types/bulletins';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

const SLIDE_DURATION = 6000;

function isExternalAdLink(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export type WorkbenchAdBoxProps = {
  ads: Bulletin[];
  isLoading?: boolean;
  isError?: boolean;
  className?: string;
};

const BOX_CLASS = cn(
  'relative w-full overflow-hidden rounded-kv-shell border border-kv-border/70 bg-kv-surface-muted shadow-kv-soft',
  WORKBENCH_AD_ASPECT_CLASS
);

function AdSlideContent({ ad }: { ad: Bulletin }) {
  return (
    <>
      {ad.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL در mock؛ next/image اعمال نمی‌شود
        <img
          src={ad.imageUrl}
          alt={ad.title}
          draggable={false}
          className="size-full object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-kv-surface-muted px-kv-group pb-24 text-center">
          <KvTypography variant="caption" tone="muted" as="p">
            <span className="line-clamp-6 whitespace-pre-line">
              {ad.body || ad.title}
            </span>
          </KvTypography>
        </div>
      )}
    </>
  );
}

/**
 * باکس تبلیغ مشترک میز کار — اسلایدر با نسبت ۳:۴.
 * الگوی spot: بدون تبلیغ فعال چیزی رندر نمی‌کند (والد ستون را حذف می‌کند).
 */
export function WorkbenchAdBox({
  ads,
  isLoading = false,
  isError = false,
  className,
}: WorkbenchAdBoxProps) {
  const labelId = useId();
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const visibleAds = isError ? [] : ads;
  const count = visibleAds.length;
  const adsKey = visibleAds.map((ad) => ad.id).join('|');
  const [slide, setSlide] = useState({ key: adsKey, index: 0 });
  const current = slide.key === adsKey ? slide.index : 0;
  const active = count === 0 ? 0 : Math.min(current, count - 1);
  const shown = count > 0 ? visibleAds[active] : undefined;

  const setCurrent = (value: number | ((prev: number) => number)) => {
    setSlide((prev) => {
      const base = prev.key === adsKey ? prev.index : 0;
      const index = typeof value === 'function' ? value(base) : value;
      return { key: adsKey, index };
    });
  };

  useEffect(() => {
    if (count <= 1 || paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      setSlide((prev) => {
        const base = prev.key === adsKey ? prev.index : 0;
        return { key: adsKey, index: (base + 1) % count };
      });
    }, SLIDE_DURATION);
    return () => window.clearInterval(timer);
  }, [adsKey, count, paused, reducedMotion, active]);

  const goTo = (index: number) => {
    if (count === 0) return;
    setCurrent(((index % count) + count) % count);
  };

  // Spot: خالی / خطا / لود بدون داده → null تا ستون گرید جمع شود.
  if (isLoading || isError || count === 0 || !shown) {
    return null;
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      className={cn(BOX_CLASS, className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onKeyDown={(event) => {
        if (count <= 1) return;
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goTo(active + 1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          goTo(active - 1);
        }
      }}
    >
      <style>{`@keyframes kv-ad-carousel-progress{from{width:0%}to{width:100%}}`}</style>
      <span id={labelId} className="sr-only">
        تبلیغات
      </span>

      {/* مسیر اسلاید: dir=ltr تا جابه‌جایی افقی در RTL پایدار بماند؛ متن داخل هر اسلاید rtl است. */}
      <div className="absolute inset-0 overflow-hidden" dir="ltr">
        <div
          className={cn(
            'flex h-full will-change-transform',
            reducedMotion
              ? ''
              : 'transition-transform duration-500 ease-out motion-reduce:transition-none'
          )}
          style={{ transform: `translate3d(-${active * 100}%, 0, 0)` }}
        >
          {visibleAds.map((ad, index) => {
            const isActive = index === active;
            return (
              <div
                key={ad.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${toPersianDigits(String(index + 1))} از ${toPersianDigits(String(count))}`}
                aria-hidden={!isActive}
                inert={!isActive}
                dir="rtl"
                className="relative h-full w-full shrink-0 grow-0 basis-full"
              >
                <AdSlideContent ad={ad} />
              </div>
            );
          })}
        </div>
      </div>

      <span className="pointer-events-none absolute start-2 top-2 z-10 rounded-kv-tight bg-kv-canvas/90 px-1.5 py-0.5 text-[10px] font-bold text-kv-text-muted shadow-kv-soft">
        تبلیغ
      </span>

      {count > 1 ? (
        <span className="pointer-events-none absolute end-2 top-2 z-10 rounded-kv-tight bg-kv-canvas/90 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-kv-text-muted shadow-kv-soft">
          {toPersianDigits(String(active + 1))}
          {' / '}
          {toPersianDigits(String(count))}
        </span>
      ) : null}

      {/* گرادیان پایین = بک‌گراند مین (canvas) در لایت و دارک */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 z-10 flex min-h-[22%] flex-col justify-end gap-1.5 bg-gradient-to-t from-kv-canvas via-kv-canvas/85 to-transparent px-2.5 pb-2.5 pt-10',
          count > 1 && 'pe-28'
        )}
      >
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

      {count > 1 ? (
        <div className="absolute bottom-2 end-2 z-20 flex max-w-[calc(100%-1rem)] items-center gap-0.5 rounded-full bg-kv-canvas/95 p-0.5 shadow-kv-soft">
          <button
            type="button"
            aria-label="تبلیغ قبلی"
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-kv-text hover:bg-kv-surface-muted focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-kv-ring/40"
            onClick={() => goTo(active - 1)}
          >
            <FaIcon icon={faIcons.chevronRight} size="2xs" />
          </button>
          <div
            className="flex min-w-0 items-center gap-1 overflow-x-auto px-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="انتخاب تبلیغ"
          >
            {visibleAds.map((ad, index) => {
              const isActive = index === active;
              return (
                <button
                  key={ad.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`تبلیغ ${toPersianDigits(String(index + 1))}`}
                  className={cn(
                    'rounded-full transition-all focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-kv-ring/40',
                    isActive
                      ? 'relative h-1.5 w-4 overflow-hidden bg-kv-text/20'
                      : 'size-1.5 bg-kv-text/30 hover:bg-kv-text/50'
                  )}
                  onClick={() => goTo(index)}
                >
                  {isActive && !paused && !reducedMotion ? (
                    <span
                      key={`${ad.id}-${active}-${paused}`}
                      className="absolute inset-y-0 start-0 rounded-full bg-kv-text"
                      style={{
                        animation: `kv-ad-carousel-progress ${SLIDE_DURATION}ms linear forwards`,
                      }}
                      aria-hidden
                    />
                  ) : null}
                  {isActive && (paused || reducedMotion) ? (
                    <span
                      className="absolute inset-y-0 start-0 w-full rounded-full bg-kv-text"
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            aria-label="تبلیغ بعدی"
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-kv-text hover:bg-kv-surface-muted focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-kv-ring/40"
            onClick={() => goTo(active + 1)}
          >
            <FaIcon icon={faIcons.chevronLeft} size="2xs" />
          </button>
        </div>
      ) : null}
    </section>
  );
}

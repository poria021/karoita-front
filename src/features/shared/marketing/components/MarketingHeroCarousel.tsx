'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import type { LandingBanner } from '@/types/landing-cms';

import { useMarketingPanel } from '../lib/marketingPanelContext';
import { resolveMarketingNavTarget } from '../lib/marketingLinks';

const SLIDE_DURATION = 6000;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * خواندن ترجیح کاهش حرکت از طریق useSyncExternalStore — الگوی پیشنهادی React
 * برای منابع خارجی مثل matchMedia، بدون setState-in-effect و بدون hydration mismatch.
 * getServerSnapshot در SSR مقدار امن (بدون کاهش حرکت) برمی‌گرداند.
 */
function subscribeReducedMotion(notify: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}
function readReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
function readReducedMotionServer(): boolean {
  return false;
}

type MarketingHeroCarouselProps = {
  banners: LandingBanner[];
};

export function MarketingHeroCarousel({
  banners,
}: MarketingHeroCarouselProps) {
  const slides = banners;
  const [currentSlide, setCurrentSlide] = useState(0);
  // a11y: اگر کاربر کاهش حرکت خواسته، پیشروی خودکار را خاموش می‌کنیم.
  // اسلایدها با دکمه‌های تب همچنان دستی قابل انتخاب‌اند.
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    readReducedMotionServer,
  );
  const { openPanel } = useMarketingPanel();
  const activeIndex =
    slides.length === 0 ? 0 : Math.min(currentSlide, slides.length - 1);

  useEffect(() => {
    if (slides.length <= 1 || reducedMotion) return;

    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);

    return () => clearInterval(slideInterval);
  }, [slides.length, reducedMotion]);

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index);
  };

  if (slides.length === 0) {
    return (
      <section
        id="hero"
        className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-kv-canvas sm:aspect-video lg:aspect-[21/9]"
        aria-label="بنرهای اطلاع‌رسانی اصلی"
      >
        <h1 className="sr-only">
          کارویتا | سامانه جامع آموزش نظری، مهارتی و مدیریت کارورزی
        </h1>
      </section>
    );
  }

  return (
    <section
      id="hero"
      className="relative aspect-[4/3] w-full overflow-hidden bg-kv-canvas sm:aspect-video lg:aspect-[21/9]"
      aria-label="بنرهای اطلاع‌رسانی اصلی"
    >
      <style>{`@keyframes kv-carousel-progress{from{width:0%}to{width:100%}}`}</style>
      <h1 className="sr-only">
        کارویتا | سامانه جامع آموزش نظری، مهارتی و مدیریت کارورزی
      </h1>

      {slides.map((slide, index) => {
        // فقط وقتی ادمین CMS هنگام آپلود لینک گذاشته قابل کلیک است.
        const target = (slide.link ?? '').trim()
          ? resolveMarketingNavTarget(slide.link)
          : ({ kind: 'none' } as const);
        const isActive = activeIndex === index;
        // next/image فقط برای مسیر محلی (`/marketing/...`). URLهای https/S3/data
        // بدون remotePatterns یا بهینه‌ساز ناشناس صفحه را می‌شکنند.
        const useNextImage =
          slide.imageUrl.startsWith('/') && !slide.imageUrl.startsWith('//');

        const imageEl = useNextImage ? (
          <Image
            src={slide.imageUrl}
            alt={slide.title || 'بنر اطلاع‌رسانی کارویتا'}
            fill
            priority={index === 0}
            className="object-cover object-center"
            sizes="100vw"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- data-URL / S3 / CMS دلخواه
          <img
            src={slide.imageUrl}
            alt={slide.title || 'بنر اطلاع‌رسانی کارویتا'}
            className="size-full object-cover object-center"
          />
        );

        const content = <>{imageEl}</>;

        const frameClass = 'relative block size-full overflow-hidden';

        return (
          <div
            key={slide.id ?? index}
            className={`absolute inset-0 size-full transition-opacity duration-700 ${
              isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            {target.kind === 'external' ? (
              <a
                href={target.href}
                target="_blank"
                rel="noopener noreferrer"
                className={frameClass}
              >
                {content}
              </a>
            ) : null}
            {target.kind === 'internal' ? (
              <Link href={target.href} prefetch={false} className={frameClass}>
                {content}
              </Link>
            ) : null}
            {target.kind === 'panel' ? (
              <button
                type="button"
                onClick={() => openPanel(target.id)}
                className={`${frameClass} cursor-pointer text-start`}
                aria-label={slide.title || 'باز کردن بخش مرتبط'}
              >
                {content}
              </button>
            ) : null}
            {target.kind === 'none' ? (
              <div className={frameClass}>{content}</div>
            ) : null}
          </div>
        );
      })}

      {/* نشانگر اسلاید */}
      {slides.length > 1 && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-1.5 sm:bottom-6"
          role="tablist"
          aria-label="انتخاب اسلاید"
        >
          {slides.map((slide, index) => {
            const isActive = activeIndex === index;
            return (
              <div
                key={slide.id ?? index}
                className="pointer-events-auto flex items-center justify-center"
              >
                <button
                  onClick={() => handleSlideClick(index)}
                  className={`block rounded-kv-tight backdrop-blur-sm transition-all ${
                    isActive
                      ? 'relative h-1 w-6 overflow-hidden bg-kv-brand/20 shadow-kv-soft sm:h-1.5 sm:w-8'
                      : 'size-1 bg-kv-brand/20 shadow-kv-soft hover:bg-white sm:size-1.5'
                  }`}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`رفتن به اسلاید ${index + 1}`}
                  title={`رفتن به اسلاید ${index + 1}`}
                >
                  {isActive ? (
                    <div
                      className="h-full rounded-kv-tight bg-white"
                      style={{
                        animation: `kv-carousel-progress ${SLIDE_DURATION}ms linear forwards`,
                      }}
                      aria-hidden
                    />
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

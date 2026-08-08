'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import type { LandingBanner } from '@/types/landing-cms';

import { useMarketingPanel } from '../lib/marketingPanelContext';
import { resolveMarketingNavTarget } from '../lib/marketingLinks';

const SLIDE_DURATION = 6000; // 6 seconds per slide
/** Progress ticks — keep UI smooth without 20Hz state churn. */
const PROGRESS_TICK_MS = 200;

type MarketingHeroCarouselProps = {
  banners: LandingBanner[];
};

export function MarketingHeroCarousel({
  banners,
}: MarketingHeroCarouselProps) {
  const slides = banners;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const { openPanel } = useMarketingPanel();
  const activeIndex =
    slides.length === 0 ? 0 : Math.min(currentSlide, slides.length - 1);

  useEffect(() => {
    if (slides.length <= 1) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 100 / (SLIDE_DURATION / PROGRESS_TICK_MS);
      });
    }, PROGRESS_TICK_MS);

    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setProgress(0);
    }, SLIDE_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearInterval(slideInterval);
    };
  }, [slides.length]);

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  if (slides.length === 0) {
    return (
      <section
        id="hero"
        className="relative flex h-[260px] w-full items-center justify-center overflow-hidden bg-kv-canvas sm:h-[360px] md:h-[460px] lg:h-[calc(100vh-4rem)] lg:max-h-[850px]"
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
      className="relative h-[260px] w-full overflow-hidden bg-kv-canvas sm:h-[360px] md:h-[460px] lg:h-[calc(100vh-4rem)] lg:max-h-[850px]"
      aria-label="بنرهای اطلاع‌رسانی اصلی"
    >
      <h1 className="sr-only">
        کارویتا | سامانه جامع آموزش نظری، مهارتی و مدیریت کارورزی
      </h1>

      {slides.map((slide, index) => {
        // Only clickable when CMS admin set a link on upload.
        const target = slide.link.trim()
          ? resolveMarketingNavTarget(slide.link)
          : ({ kind: 'none' } as const);
        const isActive = activeIndex === index;
        const isDataUrl = slide.imageUrl.startsWith('data:');

        const imageEl = isDataUrl ? (
          // CMS mock data-URL — next/image does not apply.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slide.imageUrl}
            alt={slide.title || 'بنر اطلاع‌رسانی کارویتا'}
            className="size-full object-cover object-center"
          />
        ) : (
          <Image
            src={slide.imageUrl}
            alt={slide.title || 'بنر اطلاع‌رسانی کارویتا'}
            fill
            priority={index === 0}
            className="object-cover object-center"
            sizes="100vw"
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

      {/* Slide indicators */}
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
                      ? 'relative h-1 w-6 overflow-hidden bg-white/50 shadow-kv-soft sm:h-1.5 sm:w-8'
                      : 'size-1 bg-white/50 shadow-kv-soft hover:bg-white sm:size-1.5'
                  }`}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`رفتن به اسلاید ${index + 1}`}
                  title={`رفتن به اسلاید ${index + 1}`}
                >
                  {isActive ? (
                    <div
                      className="h-full rounded-kv-tight bg-white transition-all duration-75"
                      style={{ width: `${progress}%` }}
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

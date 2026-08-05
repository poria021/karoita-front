'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import type { LandingBanner } from '@/types/landing-cms';

import { useMarketingPanel } from '../lib/marketingPanelContext';
import { resolveMarketingNavTarget } from '../lib/marketingLinks';

const SLIDE_DURATION = 6000; // 6 seconds per slide
const FALLBACK_BANNER: LandingBanner = {
  id: 'fallback',
  title: 'سامانه جامع آموزش نظری و مهارتی',
  imageUrl: '/marketing/dashboard-hero.svg',
  link: '',
};

type MarketingHeroCarouselProps = {
  banners: LandingBanner[];
};

export function MarketingHeroCarousel({
  banners,
}: MarketingHeroCarouselProps) {
  const slides = banners.length > 0 ? banners : [FALLBACK_BANNER];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const { openPanel } = useMarketingPanel();

  useEffect(() => {
    if (slides.length <= 1) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 100 / (SLIDE_DURATION / 50);
      });
    }, 50);

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

  return (
    <section
      id="hero"
      className="relative h-[260px] w-full overflow-hidden bg-kv-canvas sm:h-[360px] md:h-[460px] lg:h-[calc(100vh-4rem)] lg:max-h-[850px]"
      aria-label="بنرهای اطلاع‌رسانی اصلی"
    >
      <h1 className="sr-only">
        کارویتا · سامانه جامع آموزش نظری، مهارتی و مدیریت کارورزی کشور
      </h1>

      {slides.map((slide, index) => {
        const target = resolveMarketingNavTarget(slide.link);
        const isActive = currentSlide === index;
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

        const content = (
          <>
            {imageEl}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-kv-text/35 via-transparent to-kv-surface/25"
              aria-hidden
            />
          </>
        );

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
          className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-2.5 sm:bottom-6"
          role="tablist"
          aria-label="انتخاب اسلاید"
        >
          {slides.map((slide, index) => {
            const isActive = currentSlide === index;
            return (
              <div
                key={slide.id ?? index}
                className="pointer-events-auto flex items-center justify-center"
              >
                <button
                  onClick={() => handleSlideClick(index)}
                  className={`block rounded-full backdrop-blur-sm transition-all ${
                    isActive
                      ? 'relative h-2 w-10 overflow-hidden border border-kv-border-strong bg-kv-surface/80 shadow-kv-raised sm:h-2.5 sm:w-14'
                      : 'size-2 bg-kv-border-strong/60 shadow-sm hover:bg-kv-brand sm:size-2.5'
                  }`}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`رفتن به اسلاید ${index + 1}`}
                  title={`رفتن به اسلاید ${index + 1}`}
                >
                  {isActive && (
                    <div
                      className="h-full rounded-full bg-kv-brand transition-all duration-75"
                      style={{ width: `${progress}%` }}
                      aria-hidden
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type {
  LessonPendingReview,
  LessonReportFilter,
} from '@/services/reports/real/lesson-reports.api';
import type { UserRole } from '@/types/auth';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardCoursePendingReports } from '../hooks/useDashboardCoursePendingReports';
import { pendingBackground } from '../lib/pending-card-background';
import { workbenchErrorText } from './WorkbenchUnavailableNote';

export type WorkbenchCoursePendingReportsBoxProps = LessonReportFilter & {
  role: UserRole;
  className?: string;
  style?: CSSProperties;
};

/**
 * کارت درس — کاملاً وسط‌چین و بدون آیکون:
 * بالا عنوان، وسط عدد، پایین متن ثابت «در انتظار بررسی».
 * ارتفاع از والد (هم‌قد باکس اطلاعیه‌ها) می‌آید؛ عرض پایه با نسبت ۳∶۴ و با `grow`
 * کارت‌ها وقتی کم‌اند کل عرض باکس را پر می‌کنند (جای خالی نمی‌ماند)، وگرنه اسکرول افقی.
 */
function PendingCard({
  card,
  maxPending,
}: {
  card: LessonPendingReview;
  /** بیشترین pendingCount بین کارت‌ها — برای شدت زرد نسبی. */
  maxPending: number;
}) {
  const label = `${card.title}: ${toPersianDigits(card.pendingCount)} در انتظار بررسی`;
  return (
    <li className="aspect-[3/4] h-full w-auto shrink-0 grow snap-start select-none">
      <div
        title={label}
        aria-label={label}
        className="flex h-full flex-col items-center justify-between gap-0 rounded-kv-control border border-kv-border/70 px-kv-group pb-kv-field pt-kv-inline text-center shadow-none"
        style={{
          backgroundColor: pendingBackground(card.pendingCount, maxPending),
        }}
      >
        <span className="block w-full truncate text-center text-xs font-black leading-none text-kv-text">
          {card.title}
        </span>
        <span className="flex w-full flex-1 items-center justify-center text-center font-sans text-xl font-black tabular-nums leading-none tracking-tight text-kv-text">
          {toPersianDigits(card.pendingCount)}
        </span>
        <span className="block w-full text-center text-xs font-bold leading-snug text-kv-text">
          در انتظار بررسی
        </span>
      </div>
    </li>
  );
}

/** هنوز محتوایی در سمت چپ (ادامهٔ ریل در RTL) برای اسکرول هست؟ */
function canScrollTowardEnd(el: HTMLElement): boolean {
  const max = el.scrollWidth - el.clientWidth;
  if (max <= 2) return false;
  const left = el.scrollLeft;
  // Chrome RTL: scrollLeft منفی؛ Firefox/Safari: مثبت از ۰ تا max.
  if (left < 0) return left > -max + 2;
  return left < max - 2;
}

/**
 * «در انتظار بررسی» — داده از `GET /reports/lessons/pending-reviews`
 * (معلم راهنما، مدیر مدرسه، استاد راهنما). هر آیتم یک کارت است:
 * `title` عنوان، `pendingCount` عدد بزرگ وسط، پایین متن ثابت «در انتظار بررسی».
 * API فقط درس‌های دارای مورد در انتظار را می‌دهد؛ `data` خالی = هیچ کارت.
 * `semesterId` / `structure` اختیاری‌اند؛ با تغییرشان همان درخواست دوباره زده می‌شود.
 * اسکرول‌بار فقط با هاور دیده می‌شود؛ فلش سمت چپ وقتی هنوز محتوایی برای اسکرول هست.
 */
export function WorkbenchCoursePendingReportsBox({
  role,
  semesterId,
  structure,
  className,
  style,
}: WorkbenchCoursePendingReportsBoxProps) {
  const { isLoading, isError, isForbidden, cards: rawCards } =
    useDashboardCoursePendingReports(role, {
      semesterId,
      structure,
    });
  // محافظ UI: شمارش غیرمثبت کارت نمی‌شود (API معمولاً چنین ردیفی نمی‌فرستد).
  const cards = useMemo(
    () => rawCards.filter((card) => card.pendingCount > 0),
    [rawCards]
  );
  const maxPending = useMemo(
    () => cards.reduce((max, card) => Math.max(max, card.pendingCount), 0),
    [cards]
  );

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [showEndHint, setShowEndHint] = useState(false);

  const refreshScrollHint = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) {
      setShowEndHint(false);
      return;
    }
    setShowEndHint(canScrollTowardEnd(el));
  }, []);

  useEffect(() => {
    refreshScrollHint();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => refreshScrollHint();
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(() => refreshScrollHint());
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [cards, refreshScrollHint]);

  // کشیدن با ماوس (لمس خودش سوایپ بومی دارد).
  const drag = useRef<{ x: number; left: number; pointerId: number } | null>(
    null
  );
  const [dragging, setDragging] = useState(false);
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag.current = {
      x: event.clientX,
      left: event.currentTarget.scrollLeft,
      pointerId: event.pointerId,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    if (!start) return;
    event.currentTarget.scrollLeft = start.left - (event.clientX - start.x);
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  // خالی = هیچ کارت (و هیچ باکس خالی)؛ لودینگ/خطا هنوز نشان داده می‌شود.
  if (!isLoading && !isError && cards.length === 0) {
    return null;
  }

  const state = isLoading ? 'loading' : isError ? 'error' : 'ready';

  return (
    <div className={cn('flex min-h-0 flex-col', className)} style={style}>
      {state === 'loading' ? (
        <div
          role="status"
          aria-label="در حال بارگذاری گزارش‌های در انتظار بررسی"
          className="flex min-h-0 flex-1 items-center justify-center"
        >
          <Spinner className="size-4 text-kv-brand" aria-hidden="true" />
        </div>
      ) : state === 'error' ? (
        <KvEmptyState
          title={workbenchErrorText(isForbidden, 'گزارش‌های در انتظار بررسی فعلاً در دسترس نیست؛ کمی بعد دوباره تلاش کنید.')}
          className="min-h-0 flex-1 py-kv-pair"
        />
      ) : (
        <div className="relative min-h-0 min-w-0 flex-1">
          <div
            ref={scrollerRef}
            role="region"
            aria-label="گزارش‌های در انتظار بررسی هر درس (با سوایپ افقی)"
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className={cn(
              'kv-scroll-hover absolute inset-0 overflow-x-auto overscroll-x-contain px-1 pb-2',
              '[scrollbar-width:thin]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring',
              dragging
                ? 'cursor-grabbing snap-none'
                : 'cursor-grab snap-x snap-mandatory'
            )}
          >
            <ul className="flex h-full w-max min-w-full list-none items-stretch gap-kv-group">
              {cards.map((card, index) => (
                <PendingCard
                  key={`${card.title}-${index}`}
                  card={card}
                  maxPending={maxPending}
                />
              ))}
            </ul>
          </div>

          {showEndHint ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 end-0 z-10 flex w-10 items-center justify-center bg-gradient-to-l from-transparent to-kv-canvas/90 ps-1"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-kv-surface/95 text-kv-text shadow-kv-soft ring-1 ring-kv-border/60">
                <FaIcon icon={faIcons.chevronLeft} size="xs" />
              </span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

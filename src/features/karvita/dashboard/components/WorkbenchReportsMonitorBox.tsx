'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { Spinner } from '@/components/ui/spinner';
import { useActiveCourseDefinitions } from '@/hooks/useActiveCourseDefinitions';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardSupervisorReplyStatus } from '../hooks/useDashboardSupervisorReplyStatus';
import {
  buildMonitorCourseShelf,
  dailyApprovalsCourseHref,
  findEvaluationModuleId,
  pendingHeatCardStyle,
  pendingHeatFactor,
  type CourseReplyStatusView,
  type EvaluationMonitorRole,
} from '../lib/supervisor-reply-status';

export type WorkbenchReportsMonitorBoxProps = {
  /**
   * نقش ناظر ارزیابی روی میز کار:
   * استاد راهنما / معلم راهنما / مدیر مدرسه.
   */
  role: EvaluationMonitorRole;
  className?: string;
  style?: CSSProperties;
};

const CARD_STEP_PX = 120; // ~size-[7rem] + gap-kv-pair

function courseHref(
  course: CourseReplyStatusView,
  catalog: ReturnType<typeof useActiveCourseDefinitions>
) {
  const moduleId = findEvaluationModuleId(
    course.courseKey,
    course.kind,
    catalog
  );
  return dailyApprovalsCourseHref({
    kind: course.kind,
    moduleId,
    courseKey: course.courseKey,
  });
}

/** کارت مربعی مینیمال — عنوان بالا، متریک وسط، جوهر `kv-monitor-ink`. */
function CourseMonitorCard({
  course,
  href,
  heatStyle,
}: {
  course: CourseReplyStatusView;
  href: string;
  heatStyle: ReturnType<typeof pendingHeatCardStyle>;
}) {
  return (
    <Link
      href={href}
      prefetch
      draggable={false}
      data-dragged="0"
      style={heatStyle as CSSProperties}
      className="flex aspect-square size-[7rem] shrink-0 snap-start flex-col items-center rounded-kv-control border p-kv-pair text-kv-monitor-ink shadow-kv-soft outline-none transition-[filter,transform] hover:brightness-[0.98] focus-visible:ring-[3px] focus-visible:ring-kv-ring/20 active:scale-[0.98]"
      aria-label={`ارزیابی ${course.courseTitle}؛ ${toPersianDigits(course.pending)} گزارش در انتظار`}
      onClick={(event) => {
        if (event.currentTarget.dataset.dragged === '1') {
          event.preventDefault();
          event.currentTarget.dataset.dragged = '0';
        }
      }}
    >
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center gap-1 text-center">
        <p className="w-full max-w-full truncate whitespace-nowrap text-center text-[10px] font-semibold leading-none tracking-tight text-inherit">
          {course.courseTitle}
        </p>
        <span className="font-sans text-2xl font-black tabular-nums leading-none tracking-tight text-inherit">
          {toPersianDigits(course.pending)}
        </span>
        <span className="whitespace-nowrap text-[10px] font-semibold leading-none tracking-tight text-inherit">
          گزارش در انتظار
        </span>
      </div>
    </Link>
  );
}

function RailArrowButton({
  side,
  onClick,
}: {
  side: 'start' | 'end';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'start' ? 'کارت‌های قبلی' : 'کارت‌های بعدی'}
      className={cn(
        'absolute top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-kv-control',
        'border border-kv-border/80 bg-kv-surface text-kv-brand shadow-kv-soft',
        'transition-colors hover:bg-kv-surface-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20',
        // حدود ۱/۴ فلش روی کارت می‌افتد (size-7 − padding ≈ overlap)
        side === 'start' ? 'start-0' : 'end-0'
      )}
    >
      <FaIcon
        icon={side === 'start' ? faIcons.chevronRight : faIcons.chevronLeft}
        size="xs"
        aria-hidden
      />
    </button>
  );
}

/**
 * ریل افقی بدون اسکرول‌بار بومی — جابه‌جایی با translate + درگ ۱:۱ ماوس.
 * viewport: overflow-hidden (هیچ اسکرول‌باری نیست).
 */
function MonitorCourseRail({
  courses,
  heatRange,
  catalog,
}: {
  courses: CourseReplyStatusView[];
  heatRange: { min: number; max: number };
  catalog: ReturnType<typeof useActiveCourseDefinitions>;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const offsetRef = useRef(0);
  const [offset, setOffset] = useState(0);
  const [maxOffset, setMaxOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startOffset: number;
    moved: boolean;
  } | null>(null);

  const clamp = useCallback((value: number, max: number) => {
    if (max <= 0) return 0;
    return Math.min(max, Math.max(0, value));
  }, []);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const max = Math.max(0, track.scrollWidth - viewport.clientWidth);
    setMaxOffset(max);
    setOffset((prev) => {
      const next = clamp(prev, max);
      offsetRef.current = next;
      return next;
    });
  }, [clamp]);

  useEffect(() => {
    measure();
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(viewport);
    ro.observe(track);
    return () => ro.disconnect();
  }, [courses, measure]);

  const applyOffset = useCallback(
    (next: number) => {
      const value = clamp(next, maxOffset);
      offsetRef.current = value;
      setOffset(value);
    },
    [clamp, maxOffset]
  );

  const stepBy = useCallback(
    (direction: 1 | -1) => {
      applyOffset(offsetRef.current + direction * CARD_STEP_PX);
    },
    [applyOffset]
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: offsetRef.current,
      moved: false,
    };
    viewport.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    // ریل RTL: محتوا با نشانگر حرکت می‌کند (درگ به راست → دیدن ابتدای لیست)
    const dx = event.clientX - drag.startX;
    if (Math.abs(dx) > 3) drag.moved = true;
    applyOffset(drag.startOffset + dx);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const viewport = viewportRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (viewport) {
      try {
        viewport.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
    }
    if (drag.moved) {
      const target = (event.target as HTMLElement | null)?.closest('a');
      if (target) target.dataset.dragged = '1';
    }
    dragRef.current = null;
    setDragging(false);
  };

  const canStart = offset > 1;
  const canEnd = offset < maxOffset - 1;

  return (
    <div className="relative min-h-0 min-w-0 flex-1">
      {canStart ? (
        <RailArrowButton side="start" onClick={() => stepBy(-1)} />
      ) : null}
      {canEnd ? <RailArrowButton side="end" onClick={() => stepBy(1)} /> : null}

      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn(
          // پدینگ کمتر از عرض فلش → حدود ۱/۴ فلش روی کارت می‌نشیند
          'flex h-full min-h-0 min-w-0 items-center overflow-hidden px-5',
          'cursor-grab [touch-action:none] select-none',
          dragging && 'cursor-grabbing'
        )}
      >
        <ul
          ref={trackRef}
          dir="rtl"
          className="flex w-max items-center gap-kv-pair will-change-transform"
          style={{
            transform: `translate3d(${offset}px, 0, 0)`,
            transition: dragging ? 'none' : 'transform 180ms ease-out',
          }}
        >
          {courses.map((course) => {
            const heat = pendingHeatFactor(
              course.pending,
              heatRange.min,
              heatRange.max
            );
            return (
              <li
                key={`${course.kind}::${course.courseKey}`}
                className="shrink-0"
              >
                <CourseMonitorCard
                  course={course}
                  href={courseHref(course, catalog)}
                  heatStyle={pendingHeatCardStyle(heat)}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/**
 * باکس «مانیتورینگ گزارش‌ها»ی مشترک میز کار
 * استاد راهنما / معلم راهنما / مدیر مدرسه — ریل سوایپ بدون اسکرول‌بار.
 */
export function WorkbenchReportsMonitorBox({
  role,
  className,
  style,
}: WorkbenchReportsMonitorBoxProps) {
  const { isLoading, isError, summary } =
    useDashboardSupervisorReplyStatus(role);
  const catalog = useActiveCourseDefinitions();

  const shelf = useMemo(
    () =>
      buildMonitorCourseShelf(summary?.courses ?? [], Number.POSITIVE_INFINITY),
    [summary?.courses]
  );

  const heatRange = useMemo(() => {
    if (shelf.queued.length === 0) return { min: 0, max: 0 };
    let min = shelf.queued[0]!.pending;
    let max = shelf.queued[0]!.pending;
    for (const course of shelf.queued) {
      if (course.pending < min) min = course.pending;
      if (course.pending > max) max = course.pending;
    }
    return { min, max };
  }, [shelf.queued]);

  const isEmpty =
    !isLoading &&
    (isError ||
      !summary ||
      summary.courses.length === 0 ||
      shelf.queued.length === 0);

  return (
    <section
      aria-labelledby="dashboard-reply-status-title"
      style={style}
      className={cn(
        'flex min-h-0 flex-col gap-kv-group overflow-hidden rounded-kv-shell border p-kv-group',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-kv-inline">
        <KvTypography
          variant="subtitle"
          as="h3"
          id="dashboard-reply-status-title"
          className="min-w-0 flex-1 truncate"
        >
          مانیتورینگ گزارش‌ها
        </KvTypography>
        {summary && shelf.queued.length > 0 ? (
          <KvTypography
            variant="caption"
            tone="muted"
            as="p"
            className="shrink-0 font-medium"
          >
            {toPersianDigits(shelf.queued.length)} درس
          </KvTypography>
        ) : null}
      </header>

      {isLoading ? (
        <div
          role="status"
          aria-label="در حال بارگذاری مانیتورینگ گزارش‌ها"
          className="flex min-h-0 flex-1 items-center justify-center"
        >
          <Spinner className="size-4 text-kv-brand" aria-hidden="true" />
        </div>
      ) : isError ? (
        <KvEmptyState
          title="فعلاً در دسترس نیست."
          className="min-h-0 py-kv-pair"
        />
      ) : !summary || summary.courses.length === 0 ? (
        <KvEmptyState
          title="گزارشی در چرخهٔ ارزیابی نیست."
          className="min-h-0 py-kv-pair"
        />
      ) : shelf.queued.length === 0 ? (
        <KvEmptyState
          title="صف خالی است"
          description={
            shelf.clearCount > 0
              ? `${toPersianDigits(shelf.clearCount)} درس بدون گزارش منتظر`
              : undefined
          }
          className="min-h-0 py-kv-pair"
        />
      ) : (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center overflow-hidden">
          <MonitorCourseRail
            courses={shelf.queued}
            heatRange={heatRange}
            catalog={catalog}
          />
          {shelf.clearCount > 0 ? (
            <KvTypography
              variant="caption"
              tone="muted"
              as="p"
              className="mt-kv-pair shrink-0 font-medium"
            >
              {toPersianDigits(shelf.clearCount)} درس بدون صف منتظر
            </KvTypography>
          ) : null}
        </div>
      )}
    </section>
  );
}

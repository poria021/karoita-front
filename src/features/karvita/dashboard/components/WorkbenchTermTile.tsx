'use client';

import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/persianDigits';

import {
  currentTermStatus,
  type CurrentTermStatus,
  type CurrentTermView,
} from '../lib/current-terms';

export const STATUS_LABEL: Record<Exclude<CurrentTermStatus, 'unknown'>, string> = {
  running: 'کلاس‌ها در جریان',
  selecting: 'انتخاب واحد باز',
  closed: 'بسته',
};

export const STATUS_CLASS: Record<Exclude<CurrentTermStatus, 'unknown'>, string> = {
  running: 'bg-kv-success-soft text-kv-success-soft-fg',
  selecting: 'bg-kv-brand-soft text-kv-brand-soft-fg',
  closed: 'bg-kv-surface-subtle text-kv-text-faint',
};

/** خط توضیح زیر عنوان: گیت‌ها و تعداد درس، فقط چیزی که API داده. */
function termMetaLine(view: CurrentTermView): string {
  if (view.title === null) return 'در حال حاضر نیم‌سال بازی ثبت نشده است';
  const parts: string[] = [];
  if (view.enrollOpen !== null) {
    parts.push(`انتخاب واحد ${view.enrollOpen ? 'باز' : 'بسته'}`);
  }
  if (view.classesStarted !== null) {
    parts.push(`کلاس‌ها ${view.classesStarted ? 'شروع شده' : 'شروع نشده'}`);
  }
  if (view.lessonCount) {
    parts.push(`${toPersianDigits(view.lessonCount)} درس`);
  }
  return parts.join(' · ');
}

/** اسکلت بارگذاری هم‌اندازهٔ تایل. */
export function WorkbenchTermTileSkeleton() {
  return (
    <div
      aria-hidden
      className="flex h-[4.5rem] w-56 animate-pulse flex-col justify-center gap-2 rounded-kv-control border border-kv-border/60 bg-kv-surface/70 px-3"
    >
      <span className="h-2.5 w-16 rounded-full bg-kv-border-muted" />
      <span className="h-3.5 w-36 rounded-full bg-kv-border-muted" />
      <span className="h-2.5 w-28 rounded-full bg-kv-border-muted" />
    </div>
  );
}

/**
 * تایل نیم‌سال جاری: نوع (ترمی/پودمان) + چیپ وضعیت، عنوان نیم‌سال، و یک خط گیت‌ها.
 */
export function WorkbenchTermTile({
  view,
  className,
}: {
  view: CurrentTermView;
  className?: string;
}) {
  const status = currentTermStatus(view);
  const meta = termMetaLine(view);

  return (
    <article
      aria-label={`${view.kindLabel} جاری`}
      className={cn(
        'flex h-[4.5rem] w-56 min-w-0 flex-col justify-center gap-0.5 rounded-kv-control border border-kv-border/70 bg-kv-surface/85 px-3 shadow-kv-soft backdrop-blur-sm',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.6875rem] font-medium text-kv-text-muted">
          {view.kindLabel}
        </span>
        {status !== 'unknown' ? (
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-px text-[0.625rem] font-bold',
              STATUS_CLASS[status]
            )}
          >
            {STATUS_LABEL[status]}
          </span>
        ) : null}
      </div>
      <p
        title={view.title ?? undefined}
        className={cn(
          'truncate text-sm font-black leading-snug',
          view.title ? 'text-kv-text' : 'text-kv-text-faint'
        )}
      >
        {view.title ?? 'نیم‌سال فعالی ندارد'}
      </p>
      <p className="truncate text-[0.6875rem] text-kv-text-muted" title={meta}>
        {meta}
      </p>
    </article>
  );
}

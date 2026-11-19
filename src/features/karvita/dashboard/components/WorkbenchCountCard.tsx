import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { FaIcon } from '@/components/shared/FaIcon';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/persianDigits';

type WorkbenchCountCardProps = {
  icon: IconDefinition;
  label: string;
  value: number;
  /** فهرست قطع شده؛ عدد «دست‌کم» است و با «+» نشان داده می‌شود. */
  atLeast?: boolean;
  caption?: string;
  className?: string;
};

/**
 * کارت شمارنده‌ی میز کار — آیکون → برچسب → عدد.
 * هر کارت یک سطح مستقل با بردر خودش است (نه خانه‌ی یک گرید پیوسته).
 */
export function WorkbenchCountCard({
  icon,
  label,
  value,
  atLeast = false,
  caption,
  className,
}: WorkbenchCountCardProps) {
  return (
    <div
      role="group"
      aria-label={`${label}: ${toPersianDigits(value)}${atLeast ? ' یا بیشتر' : ''}`}
      className={cn(
        'flex min-h-0 min-w-0 flex-col items-center justify-center gap-1 rounded-kv-control border border-kv-border/50 bg-kv-surface-muted/40 px-2 py-2 text-center',
        className
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-kv-control bg-kv-surface text-kv-brand">
        <FaIcon icon={icon} size="sm" aria-hidden />
      </span>
      <p className="line-clamp-1 w-full text-[11px] font-medium leading-snug text-kv-text-muted">
        {label}
      </p>
      <p className="font-sans text-2xl font-black tabular-nums leading-none tracking-tight text-kv-text">
        {toPersianDigits(value)}
        {atLeast ? '+' : ''}
      </p>
      {caption ? (
        <p className="line-clamp-1 w-full text-[10px] font-medium leading-snug text-kv-text-muted">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

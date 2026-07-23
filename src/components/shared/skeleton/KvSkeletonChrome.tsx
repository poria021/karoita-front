import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { cn } from '@/lib/utils';

export type KvSkeletonTabTrackProps = {
  className?: string;
  /**
   * Track width — approximate real `AppTabsList` (`w-fit` or full for wrap).
   * Height/radius match AppTabs: ~50px (field h-11 + track pad), `rounded-kv-control`.
   */
  trackClassName?: string;
  label?: string;
};

/**
 * Mirrors `AppTabsList` track on all breakpoints (same chrome as desktop).
 */
export function KvSkeletonTabTrack({
  className,
  trackClassName,
  label = 'در حال بارگذاری تب‌ها',
}: KvSkeletonTabTrackProps) {
  return (
    <div className={cn('mb-kv-pair', className)}>
      <KvSkeleton
        label={label}
        className={cn(
          'h-12 max-w-full rounded-kv-control',
          trackClassName ?? 'w-full sm:w-[28rem]'
        )}
      />
    </div>
  );
}

export type KvSkeletonToolbarProps = {
  className?: string;
  /** Match Org toolbar: `border-t` only when real UI has it. */
  withTopBorder?: boolean;
};

/** Toolbar bones — optional border-t chrome to mirror real toolbars. */
export function KvSkeletonToolbar({
  className,
  withTopBorder = false,
}: KvSkeletonToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-kv-group lg:flex-row lg:items-center lg:justify-between',
        withTopBorder && 'border-t border-kv-border pt-kv-section',
        className
      )}
      aria-hidden
    >
      <div className="flex min-w-0 flex-col gap-kv-field">
        <KvSkeleton className="h-5 w-48 rounded-kv-control" />
        <KvSkeleton className="h-3 w-72 max-w-full rounded-kv-control" />
      </div>
      <div className="flex w-full flex-col gap-kv-inline sm:flex-row sm:items-center lg:w-auto">
        <KvSkeleton className="h-11 w-full rounded-kv-control sm:w-64" />
        <KvSkeleton className="h-11 w-full rounded-kv-control sm:w-32" />
      </div>
    </div>
  );
}

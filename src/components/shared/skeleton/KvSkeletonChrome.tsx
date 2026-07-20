import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { cn } from '@/lib/utils';

export type KvSkeletonTabTrackProps = {
  className?: string;
  /**
   * Desktop track width — should approximate real `AppTabsList` (`md:w-fit`).
   * Height/radius match AppTabs: ~42px, `rounded-kv-control` (not pill / not w-full on md).
   */
  trackClassName?: string;
  label?: string;
};

/**
 * Mirrors desktop `AppTabsList` track (radius/height/w-fit),
 * not a full-width rounded-full bar.
 */
export function KvSkeletonTabTrack({
  className,
  trackClassName,
  label = 'در حال بارگذاری تب‌ها',
}: KvSkeletonTabTrackProps) {
  return (
    <div className={cn('mb-kv-section space-y-kv-group', className)}>
      <KvSkeleton
        label={label}
        className={cn(
          // Width comes from trackClassName (approx real AppTabsList md:w-fit).
          'hidden h-[42px] max-w-full rounded-kv-control md:block',
          trackClassName
        )}
      />
      <KvSkeleton
        aria-hidden
        className="h-[42px] w-full rounded-kv-control md:hidden"
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
      <div className="flex min-w-0 flex-col gap-2">
        <KvSkeleton className="h-5 w-48 rounded-md" />
        <KvSkeleton className="h-3 w-72 max-w-full rounded-md" />
      </div>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
        <KvSkeleton className="h-11 w-full rounded-lg sm:w-64" />
        <KvSkeleton className="h-11 w-full rounded-lg sm:w-32" />
      </div>
    </div>
  );
}

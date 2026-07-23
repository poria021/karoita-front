import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { cn } from '@/lib/utils';

export type KvSkeletonTabTrackBreakpoint = 'sm' | 'md' | 'lg';

export type KvSkeletonTabTrackProps = {
  className?: string;
  /**
   * Desktop track width — should approximate real `AppTabsList` (`md:w-fit` / `lg:w-fit`).
   * Height/radius match AppTabs: ~42px, `rounded-kv-control` track (not pill / not w-full on desktop).
   */
  trackClassName?: string;
  label?: string;
  /**
   * Match the real tabs breakpoint (`OrgStructureSubTabs` / onboarding = lg).
   * Default `md`.
   */
  breakpoint?: KvSkeletonTabTrackBreakpoint;
};

/**
 * Mirrors desktop `AppTabsList` track (radius/height/w-fit),
 * not a full-width rounded-full bar.
 */
export function KvSkeletonTabTrack({
  className,
  trackClassName,
  label = 'در حال بارگذاری تب‌ها',
  breakpoint = 'md',
}: KvSkeletonTabTrackProps) {
  const desktopVisible =
    breakpoint === 'sm'
      ? 'hidden sm:block'
      : breakpoint === 'lg'
        ? 'hidden lg:block'
        : 'hidden md:block';
  const mobileVisible =
    breakpoint === 'sm'
      ? 'block sm:hidden'
      : breakpoint === 'lg'
        ? 'block lg:hidden'
        : 'block md:hidden';

  return (
    <div className={cn('mb-kv-section space-y-kv-group', className)}>
      <KvSkeleton
        label={label}
        className={cn(
          'h-[42px] max-w-full rounded-kv-control',
          desktopVisible,
          trackClassName
        )}
      />
      <KvSkeleton
        aria-hidden
        className={cn('h-[42px] w-full rounded-kv-control', mobileVisible)}
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

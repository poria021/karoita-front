import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { FaIcon } from '@/components/shared/FaIcon';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/persianDigits';

export type SidebarCourseIconProps = {
  icon: IconDefinition;
  /** Course level digit (1–9) overlaid bottom-end on the domain icon. */
  badge?: number;
  className?: string;
  iconClassName?: string;
};

/**
 * Domain icon (کارورزی/کارآموزی) with an optional Persian level digit
 * anchored to the bottom-end corner of the glyph.
 */
export function SidebarCourseIcon({
  icon,
  badge,
  className,
  iconClassName,
}: SidebarCourseIconProps) {
  const showBadge = typeof badge === 'number' && badge >= 1 && badge <= 9;

  return (
    <span
      className={cn(
        'relative inline-flex size-5 shrink-0 items-center justify-center',
        className
      )}
      aria-hidden
    >
      <FaIcon
        icon={icon}
        size="sm"
        className={cn('text-center transition-colors', iconClassName)}
      />
      {showBadge ? (
        <span
          className={cn(
            'absolute -start-0.5 -bottom-0.5 flex min-w-3.5 items-center justify-center',
            'rounded-full bg-kv-surface px-0.5 text-xs font-black leading-none',
            'transition-colors',
            iconClassName
          )}
        >
          {toPersianDigits(badge)}
        </span>
      ) : null}
    </span>
  );
}

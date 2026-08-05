import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { FaIcon } from '@/components/shared/FaIcon';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

export type SidebarCourseIconProps = {
  icon: IconDefinition;
  /** Course level digit (1–9) shown as Persian badge; omit for plain base icon. */
  badge?: number;
  /** Parent group — domain icon composed with a compact list mark. */
  groupMark?: boolean;
  className?: string;
  iconClassName?: string;
};

/**
 * Domain icon (کارورزی/کارآموزی) optionally composed with a Persian level digit.
 */
export function SidebarCourseIcon({
  icon,
  badge,
  groupMark = false,
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
            'absolute -end-1 -bottom-1 flex min-w-3.5 items-center justify-center',
            'rounded-full bg-kv-surface px-0.5 text-xs font-black leading-none',
            'ring-1 ring-kv-border',
            iconClassName
          )}
        >
          {toPersianDigits(badge)}
        </span>
      ) : null}
      {groupMark && !showBadge ? (
        <span
          className={cn(
            'absolute -end-1 -bottom-1 flex size-3 items-center justify-center',
            'rounded-full bg-kv-surface ring-1 ring-kv-border',
            iconClassName
          )}
        >
          <FaIcon icon={faIcons.rectangleList} size="2xs" />
        </span>
      ) : null}
    </span>
  );
}

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
 * Domain icon (کارورزی/کارآموزی) optionally composed with a Persian level digit
 * on the physical right of the glyph (LTR cluster).
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
        'inline-flex min-w-5 shrink-0 items-center justify-start gap-0.5',
        className
      )}
      dir="ltr"
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
            'text-xs font-black leading-none transition-colors',
            iconClassName
          )}
        >
          {toPersianDigits(badge)}
        </span>
      ) : null}
      {groupMark && !showBadge ? (
        <FaIcon
          icon={faIcons.rectangleList}
          size="2xs"
          className={cn('transition-colors', iconClassName)}
        />
      ) : null}
    </span>
  );
}

'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { cn } from '@/lib/utils';

/**
 * Optical size scale (px). Solid FA glyphs read heavier than Lucide outlines,
 * so defaults stay a step smaller than the old 16px Lucide baseline.
 *
 * - 2xs: tiny actions (trash chip)
 * - xs:  field chrome (lock/hint/error)
 * - sm:  field addons, tabs, select chevrons
 * - md:  nav / header / buttons / alerts
 * - lg:  section / page headers
 * - xl:  empty / hero emphasis
 */
export type FaIconSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_PX: Record<FaIconSize, number> = {
  '2xs': 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
};

export type FaIconProps = {
  icon: IconDefinition;
  /** Prefer this over Tailwind `size-*` — FA CSS otherwise sizes by parent `em`. */
  size?: FaIconSize;
  className?: string;
  fixedWidth?: boolean;
  spin?: boolean;
};

/**
 * Shared Font Awesome solid icon wrapper (project iconography standard).
 * Prefer this over raw `FontAwesomeIcon` in app/feature UI.
 */
export function FaIcon({
  icon,
  size = 'sm',
  className,
  fixedWidth,
  spin,
}: FaIconProps) {
  const px = SIZE_PX[size];

  return (
    <FontAwesomeIcon
      icon={icon}
      fixedWidth={fixedWidth}
      spin={spin}
      // Inline px beats FA's `height: 1em` / `width: 1.25em` parent-em sizing.
      style={{ width: px, height: px, fontSize: px }}
      className={cn('shrink-0', className)}
      aria-hidden
    />
  );
}

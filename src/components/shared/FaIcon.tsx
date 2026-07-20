'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { cn } from '@/lib/utils';

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
  size?: FaIconSize;
  className?: string;
  fixedWidth?: boolean;
  spin?: boolean;
};

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
      style={{ width: px, height: px, fontSize: px }}
      className={cn('shrink-0', className)}
      aria-hidden
    />
  );
}

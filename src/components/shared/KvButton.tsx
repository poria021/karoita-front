import * as React from 'react';
import type { VariantProps } from 'class-variance-authority';

import {
  Button,
  buttonVariants,
  type ButtonAppearance,
  type ButtonColor,
  type ButtonSize,
} from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export type KvButtonColor = ButtonColor;
export type KvButtonAppearance = ButtonAppearance;
export type KvButtonIconPosition = 'start' | 'end';
export type KvButtonSize = ButtonSize;

export type KvButtonProps = Omit<React.ComponentProps<'button'>, 'color'> &
  VariantProps<typeof buttonVariants> & {
    color?: KvButtonColor;
    appearance?: KvButtonAppearance;
    size?: KvButtonSize;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: KvButtonIconPosition;
    loading?: boolean;
    asChild?: boolean;
  };

export function resolveKvButtonSize(
  size: ButtonSize,
  isIconOnly: boolean
): ButtonSize {
  if (!isIconOnly) return size;
  if (size === 'xs') return 'icon-xs';
  if (size === 'sm') return 'icon-sm';
  if (size === 'md') return 'icon';
  if (size === 'lg') return 'icon-lg';
  return size;
}

export function KvButton({
  className,
  color = 'cta',
  appearance = 'solid',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'start',
  loading = false,
  asChild = false,
  disabled,
  children,
  ...props
}: KvButtonProps) {
  const hasChildren =
    children !== undefined && children !== null && children !== false;
  const resolvedIcon = loading ? (
    <Spinner data-icon="inline-start" aria-hidden="true" />
  ) : (
    icon
  );
  const isIconOnly = Boolean(resolvedIcon) && !hasChildren;
  const resolvedSize = resolveKvButtonSize(size, isIconOnly);
  const resolvedIconPosition = loading ? 'start' : iconPosition;

  const content = asChild ? (
    children
  ) : (
    <>
      {resolvedIcon && (resolvedIconPosition === 'start' || isIconOnly)
        ? resolvedIcon
        : null}
      {hasChildren ? children : null}
      {resolvedIcon && resolvedIconPosition === 'end' && !isIconOnly
        ? resolvedIcon
        : null}
    </>
  );

  return (
    <Button
      data-slot="kv-button"
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      color={color}
      appearance={appearance}
      size={resolvedSize}
      fullWidth={fullWidth}
      asChild={asChild}
      disabled={disabled || loading}
      className={cn(className)}
      {...props}
    >
      {content}
    </Button>
  );
}

export { buttonVariants as kvButtonVariants };

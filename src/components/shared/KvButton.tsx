import * as React from 'react';
import type { VariantProps } from 'class-variance-authority';

import { KvSpinner } from '@/components/shared/KvSpinner';
import {
  Button,
  buttonVariants,
  type ButtonAppearance,
  type ButtonColor,
  type ButtonSize,
} from '@/components/ui/button';
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
    /** Shows spinner and disables the button while true. */
    loading?: boolean;
    asChild?: boolean;
  };

/**
 * Maps text sizes → square icon sizes so icon-only stays proportional
 * without ignoring the caller's density intent (`sm` stays compact).
 * Explicit `icon` / `icon-sm` / `icon-lg` pass through unchanged.
 */
function resolveSize(size: ButtonSize, isIconOnly: boolean): ButtonSize {
  if (!isIconOnly) return size;
  if (size === 'sm') return 'icon-sm';
  if (size === 'md') return 'icon';
  if (size === 'lg') return 'icon-lg';
  return size;
}

/**
 * Product button — wraps Shadcn `ui/button` with loading / icon helpers.
 * Prefer over raw `Button` in app/feature UI.
 *
 * Icon-only: pass `size="sm"|"md"|"lg"` for density, or `icon-sm`|`icon`|`icon-lg`
 * explicitly. Size is never forced to a single square.
 */
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
    <KvSpinner data-icon="inline-start" aria-hidden="true" />
  ) : (
    icon
  );
  const isIconOnly = Boolean(resolvedIcon) && !hasChildren;
  const resolvedSize = resolveSize(size, isIconOnly);
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

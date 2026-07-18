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
 * Product button — wraps Shadcn `ui/button` with loading / icon helpers.
 * Prefer over raw `Button` in app/feature UI.
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
  const resolvedSize = isIconOnly ? 'icon' : size;
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

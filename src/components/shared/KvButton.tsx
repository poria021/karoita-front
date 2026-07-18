import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { KvSpinner } from '@/components/shared/KvSpinner';
import { cn } from '@/lib/utils';


export type KvButtonColor =
  | 'cta'
  | 'success'
  | 'warning'
  | 'purple'
  | 'error'
  | 'neutral';

export type KvButtonAppearance = 'solid' | 'secondary' | 'ghost' | 'text';

export type KvButtonIconPosition = 'start' | 'end';

export type KvButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const kvButtonVariants = cva(
  [
    'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-sans font-black',
    'whitespace-nowrap transition-all outline-none',
    'focus-visible:ring-[3px] focus-visible:ring-kv-ring/20',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      color: {
        cta: '',
        success: '',
        warning: '',
        purple: '',
        error: '',
        neutral: '',
      },
      appearance: {
        solid: 'rounded-kv-control shadow-kv-raised',
        /** OTP / cancel style — slate border + soft fill; sizes match solid */
        secondary:
          'rounded-kv-control border border-kv-border bg-kv-surface-muted text-kv-text-muted shadow-none hover:bg-kv-surface-subtle hover:text-kv-text-secondary',
        ghost: 'rounded-kv-control border',
        /** Text actions keep height for Fitts — min 44px hit area */
        text: 'min-h-11 rounded-kv-control bg-transparent px-2 py-2 shadow-none hover:bg-transparent',
      },
      size: {
        /** Fixed heights aligned with KvTextField / KvSelect (`sm|md|lg`) */
        sm: 'h-9 px-3 text-xs',
        md: 'h-11 px-4 text-xs',
        lg: 'h-12 px-6 text-xs',
        icon: 'size-11 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    compoundVariants: [
      { appearance: 'text', size: 'sm', class: 'min-h-11 px-2' },
      { appearance: 'text', size: 'md', class: 'min-h-11 px-2' },
      { appearance: 'text', size: 'lg', class: 'min-h-11 px-2' },
      { appearance: 'text', size: 'icon', class: 'size-11' },

      {
        appearance: 'solid',
        color: 'cta',
        class:
          'bg-gradient-to-br from-kv-brand to-kv-brand-active text-kv-brand-fg shadow-kv-raised shadow-kv-brand/20 hover:from-kv-brand-hover hover:to-kv-brand-active',
      },
      {
        appearance: 'solid',
        color: 'success',
        class: 'bg-kv-success text-kv-success-fg hover:bg-kv-success-hover',
      },
      {
        appearance: 'solid',
        color: 'warning',
        class: 'bg-kv-warning text-kv-warning-fg hover:bg-kv-warning-hover',
      },
      {
        appearance: 'solid',
        color: 'purple',
        class: 'bg-kv-accent text-kv-accent-fg hover:bg-kv-accent-hover',
      },
      {
        appearance: 'solid',
        color: 'error',
        class: 'bg-kv-danger text-kv-danger-fg hover:bg-kv-danger-hover',
      },
      {
        appearance: 'solid',
        color: 'neutral',
        class:
          'border border-kv-border bg-kv-surface-subtle text-kv-text-muted shadow-none hover:bg-kv-neutral-hover',
      },

      {
        appearance: 'ghost',
        color: 'cta',
        class: 'border-kv-brand-border bg-kv-brand-soft text-kv-brand-soft-fg hover:bg-kv-brand-soft-hover',
      },
      {
        appearance: 'ghost',
        color: 'success',
        class:
          'border-kv-success-border bg-kv-success-soft text-kv-success-soft-fg hover:bg-kv-success-soft-hover',
      },
      {
        appearance: 'ghost',
        color: 'warning',
        class:
          'border-kv-warning-border bg-kv-warning-soft text-kv-warning-soft-fg hover:bg-kv-warning-soft-hover',
      },
      {
        appearance: 'ghost',
        color: 'purple',
        class:
          'border-kv-accent-border bg-kv-accent-soft text-kv-accent-soft-fg hover:bg-kv-accent-soft-hover',
      },
      {
        appearance: 'ghost',
        color: 'error',
        class: 'border-kv-danger-border bg-kv-danger-soft text-kv-danger-soft-fg hover:bg-kv-danger-soft-hover',
      },
      {
        appearance: 'ghost',
        color: 'neutral',
        class:
          'border-kv-border bg-kv-surface-muted text-kv-text-muted hover:bg-kv-surface-subtle hover:text-kv-text-secondary',
      },

      {
        appearance: 'text',
        color: 'cta',
        class: 'text-kv-brand hover:text-kv-brand-soft-fg',
      },
      {
        appearance: 'text',
        color: 'success',
        class: 'text-kv-success hover:text-kv-success-soft-fg',
      },
      {
        appearance: 'text',
        color: 'warning',
        class: 'text-kv-warning hover:text-kv-warning-soft-fg',
      },
      {
        appearance: 'text',
        color: 'purple',
        class: 'text-kv-accent hover:text-kv-accent-hover',
      },
      {
        appearance: 'text',
        color: 'error',
        class: 'text-kv-danger hover:text-kv-danger-soft-fg',
      },
      {
        appearance: 'text',
        color: 'neutral',
        class: 'text-kv-text-subtle hover:text-kv-text-secondary',
      },
    ],
    defaultVariants: {
      color: 'cta',
      appearance: 'solid',
      size: 'md',
      fullWidth: false,
    },
  }
);

export type KvButtonProps = Omit<React.ComponentProps<'button'>, 'color'> &
  VariantProps<typeof kvButtonVariants> & {
    color?: KvButtonColor;
    appearance?: KvButtonAppearance;
    size?: KvButtonSize;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: KvButtonIconPosition;
    /** Shows Shadcn `Spinner` and disables the button while true. */
    loading?: boolean;
    asChild?: boolean;
  };

/**
 * Shared Karvita button — CTA / semantic colors,
 * solid | secondary | ghost | text, optional icon, full-width.
 * Prefer over raw Shadcn `Button` in app/feature UI.
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
  const Comp = asChild ? Slot.Root : 'button';
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
    <Comp
      data-slot="kv-button"
      data-color={color}
      data-appearance={appearance}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        kvButtonVariants({
          color,
          appearance,
          size: resolvedSize,
          fullWidth,
        }),
        className
      )}
      {...props}
    >
      {content}
    </Comp>
  );
}

export { kvButtonVariants };

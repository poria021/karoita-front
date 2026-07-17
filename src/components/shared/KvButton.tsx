import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

export type KvButtonColor =
  | 'cta'
  | 'success'
  | 'warning'
  | 'purple'
  | 'error'
  | 'neutral';

export type KvButtonAppearance = 'solid' | 'ghost' | 'text';

export type KvButtonIconPosition = 'start' | 'end';

export type KvButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const kvButtonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-kv-inline font-sans font-black',
    'whitespace-nowrap transition-all outline-none',
    'focus-visible:ring-[3px] focus-visible:ring-brand-500/20',
    'disabled:pointer-events-none disabled:opacity-50',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
        solid: 'rounded-xl shadow-sm',
        ghost: 'rounded-xl border',
        text: 'h-auto rounded-md bg-transparent p-0 shadow-none',
      },
      size: {
        sm: 'px-3 py-1.5 text-[11px]',
        md: 'px-4 py-2.5 text-xs',
        lg: 'px-6 py-3 text-xs',
        icon: 'size-8 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    compoundVariants: [
      /* —— solid —— */
      {
        appearance: 'solid',
        color: 'cta',
        class:
          'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/20 hover:opacity-95',
      },
      {
        appearance: 'solid',
        color: 'success',
        class: 'bg-emerald-600 text-white hover:bg-emerald-700',
      },
      {
        appearance: 'solid',
        color: 'warning',
        class: 'bg-amber-500 text-white hover:bg-amber-600',
      },
      {
        appearance: 'solid',
        color: 'purple',
        class: 'bg-violet-600 text-white hover:bg-violet-700',
      },
      {
        appearance: 'solid',
        color: 'error',
        class: 'bg-rose-600 text-white hover:bg-rose-700',
      },
      {
        appearance: 'solid',
        color: 'neutral',
        class:
          'border border-slate-200 bg-slate-100 text-slate-700 shadow-none hover:bg-slate-200',
      },
      /* —— ghost —— */
      {
        appearance: 'ghost',
        color: 'cta',
        class:
          'border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100',
      },
      {
        appearance: 'ghost',
        color: 'success',
        class:
          'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
      },
      {
        appearance: 'ghost',
        color: 'warning',
        class:
          'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100',
      },
      {
        appearance: 'ghost',
        color: 'purple',
        class:
          'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100',
      },
      {
        appearance: 'ghost',
        color: 'error',
        class: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
      },
      {
        appearance: 'ghost',
        color: 'neutral',
        class:
          'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800',
      },
      /* —— text —— */
      {
        appearance: 'text',
        color: 'cta',
        class: 'text-brand-500 hover:text-brand-700',
      },
      {
        appearance: 'text',
        color: 'success',
        class: 'text-emerald-600 hover:text-emerald-800',
      },
      {
        appearance: 'text',
        color: 'warning',
        class: 'text-amber-600 hover:text-amber-800',
      },
      {
        appearance: 'text',
        color: 'purple',
        class: 'text-violet-600 hover:text-violet-800',
      },
      {
        appearance: 'text',
        color: 'error',
        class: 'text-rose-600 hover:bg-transparent hover:text-rose-700',
      },
      {
        appearance: 'text',
        color: 'neutral',
        class: 'text-slate-500 hover:bg-transparent hover:text-slate-800',
      },
      /* text + icon size */
      {
        appearance: 'text',
        size: 'icon',
        class: 'size-6',
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

export type KvButtonProps = Omit<
  React.ComponentProps<'button'>,
  'color'
> &
  VariantProps<typeof kvButtonVariants> & {
    color?: KvButtonColor;
    appearance?: KvButtonAppearance;
    size?: KvButtonSize;
    fullWidth?: boolean;
    /** Optional leading/trailing icon (Lucide node). */
    icon?: React.ReactNode;
    /** DOM order: `start` before label, `end` after (RTL-aware with flex). */
    iconPosition?: KvButtonIconPosition;
    asChild?: boolean;
  };

/**
 * Shared Karvita button — CTA / semantic colors, solid | ghost | text,
 * optional icon, full-width. Prefer over raw Shadcn `Button` in app/feature UI.
 */
export function KvButton({
  className,
  color = 'cta',
  appearance = 'solid',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'start',
  asChild = false,
  children,
  ...props
}: KvButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';
  const isIconOnly = Boolean(icon) && (children === undefined || children === null || children === false);

  const content = asChild ? (
    children
  ) : (
    <>
      {icon && iconPosition === 'start' ? icon : null}
      {children}
      {icon && iconPosition === 'end' ? icon : null}
    </>
  );

  return (
    <Comp
      data-slot="kv-button"
      data-color={color}
      data-appearance={appearance}
      className={cn(
        kvButtonVariants({
          color,
          appearance,
          size: isIconOnly && appearance === 'text' ? 'icon' : size,
          fullWidth,
        }),
        isIconOnly && appearance !== 'text' && size !== 'icon' && 'px-2.5',
        className
      )}
      {...props}
    >
      {content}
    </Comp>
  );
}

export { kvButtonVariants };

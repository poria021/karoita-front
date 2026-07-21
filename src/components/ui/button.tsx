import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
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
        secondary:
          'rounded-kv-control border border-kv-border bg-kv-surface-muted text-kv-text-muted shadow-none hover:bg-kv-surface-subtle hover:text-kv-text-secondary',
        ghost: 'rounded-kv-control border',
        text: 'min-h-11 rounded-kv-control bg-transparent px-2 py-2 shadow-none hover:bg-transparent',
      },
      size: {
        xs: 'h-8 px-2.5 text-xs font-medium',
        sm: 'h-9 px-3 text-xs',
        md: 'h-11 px-4 text-xs',
        lg: 'h-12 px-6 text-xs',
        'icon-xs': 'size-8 p-0',
        'icon-sm': 'size-9 p-0',
        icon: 'size-11 p-0',
        'icon-lg': 'size-12 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    compoundVariants: [
      { appearance: 'text', size: 'xs', class: 'min-h-8 px-2' },
      { appearance: 'text', size: 'sm', class: 'min-h-11 px-2' },
      { appearance: 'text', size: 'md', class: 'min-h-11 px-2' },
      { appearance: 'text', size: 'lg', class: 'min-h-11 px-2' },
      { appearance: 'text', size: 'icon-xs', class: 'size-8' },
      { appearance: 'text', size: 'icon-sm', class: 'size-9' },
      { appearance: 'text', size: 'icon', class: 'size-11' },
      { appearance: 'text', size: 'icon-lg', class: 'size-12' },

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
        class:
          'border-kv-brand-border bg-kv-brand-soft text-kv-brand-soft-fg hover:bg-kv-brand-soft-hover',
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
        class:
          'border-kv-danger-border bg-kv-danger-soft text-kv-danger-soft-fg hover:bg-kv-danger-soft-hover',
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

export type ButtonColor = NonNullable<
  VariantProps<typeof buttonVariants>['color']
>;
export type ButtonAppearance = NonNullable<
  VariantProps<typeof buttonVariants>['appearance']
>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;

function Button({
  className,
  color = 'cta',
  appearance = 'solid',
  size = 'md',
  fullWidth = false,
  asChild = false,
  ...props
}: Omit<React.ComponentProps<'button'>, 'color'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-color={color}
      data-appearance={appearance}
      data-size={size}
      className={cn(
        buttonVariants({ color, appearance, size, fullWidth }),
        className
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };

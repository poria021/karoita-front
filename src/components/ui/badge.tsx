import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Shadcn-style Badge primitives. Product chrome lives in `KvBadge`.
 */
const badgeVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center justify-center gap-1',
    'rounded-kv-control border px-2.5 py-1',
    'font-sans text-xs font-bold whitespace-nowrap',
    'transition-[color,background-color,border-color]',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'border-kv-border bg-kv-surface-muted text-kv-text-secondary',
        success:
          'border-kv-success-border bg-kv-success-soft text-kv-success-soft-fg',
        warning:
          'border-kv-warning-border bg-kv-warning-soft text-kv-warning-soft-fg',
        danger:
          'border-kv-danger-border bg-kv-danger-soft text-kv-danger-soft-fg',
        info: 'border-kv-info-border bg-kv-info-soft text-kv-info-soft-fg',
        brand:
          'border-kv-brand/25 bg-kv-brand-soft text-kv-brand-soft-fg',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

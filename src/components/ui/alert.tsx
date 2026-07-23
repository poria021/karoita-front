import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-kv-control border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(theme(spacing.4))_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-1.5 gap-y-1 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-kv-surface text-kv-text',
        destructive:
          'border-kv-danger-border bg-kv-danger-soft/80 text-kv-danger-soft-fg [&>svg]:text-kv-danger *:data-[slot=alert-description]:text-kv-danger-soft-fg/90',
        warning:
          'border-kv-warning-border bg-kv-warning-soft/80 text-kv-warning-soft-fg [&>svg]:text-kv-warning *:data-[slot=alert-description]:text-kv-warning-soft-fg/90',
        info: 'border-kv-info-border bg-kv-info-soft/80 text-kv-info-soft-fg [&>svg]:text-kv-info *:data-[slot=alert-description]:text-kv-info-soft-fg/90',
        success:
          'border-kv-success-border bg-kv-success-soft/80 text-kv-success-soft-fg [&>svg]:text-kv-success *:data-[slot=alert-description]:text-kv-success-soft-fg/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'col-start-2 line-clamp-1 min-h-4 font-sans text-xs font-black tracking-tight',
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'col-start-2 grid justify-items-start gap-1 font-sans text-xs font-medium [&_p]:leading-relaxed',
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };

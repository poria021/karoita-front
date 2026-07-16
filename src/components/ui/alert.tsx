import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-2xl border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(theme(spacing.5))_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-1 items-start [&>svg]:size-5 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'border-rose-200 bg-rose-50/80 text-rose-900 [&>svg]:text-rose-600 *:data-[slot=alert-description]:text-rose-800/90',
        warning:
          'border-amber-200 bg-amber-50/80 text-amber-900 [&>svg]:text-amber-600 *:data-[slot=alert-description]:text-amber-800/90',
        info: 'border-blue-200 bg-blue-50/80 text-blue-900 [&>svg]:text-blue-600 *:data-[slot=alert-description]:text-blue-800/90',
        success:
          'border-emerald-200 bg-emerald-50/80 text-emerald-900 [&>svg]:text-emerald-600 *:data-[slot=alert-description]:text-emerald-800/90',
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
        'col-start-2 grid justify-items-start gap-1 font-sans text-[11px] font-medium [&_p]:leading-relaxed',
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };

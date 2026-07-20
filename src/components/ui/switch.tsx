'use client';

import * as React from 'react';
import { Switch as SwitchPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

function Switch({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: 'sm' | 'default';
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        'peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-kv-raised transition-colors outline-none',
        'focus-visible:border-kv-brand focus-visible:ring-[3px] focus-visible:ring-kv-ring/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        size === 'default' && 'h-7 w-12',
        size === 'sm' && 'h-5 w-9',
        'data-[state=checked]:bg-kv-success',
        'data-[state=unchecked]:bg-kv-border-strong',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none absolute top-1/2 block -translate-y-1/2 rounded-full bg-kv-surface shadow-kv-raised ring-0',
          'start-0.5 transition-[inset-inline-start] duration-200 ease-out',
          size === 'default' &&
            'size-5 data-[state=checked]:start-[calc(100%-1.25rem-0.125rem)]',
          size === 'sm' &&
            'size-3.5 data-[state=checked]:start-[calc(100%-0.875rem-0.125rem)]'
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

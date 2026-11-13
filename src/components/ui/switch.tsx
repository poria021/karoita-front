'use client';

import * as React from 'react';
import { Switch as SwitchPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

export type SwitchVisualState = 'checked' | 'unchecked' | 'mixed';

function Switch({
  className,
  size = 'default',
  visualState,
  checked,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: 'sm' | 'default';
  /**
   * حالت نمایشی سه‌حالته (روشن / خاموش / بخشی).
   * روی `data-visual-state` می‌نشیند تا با `data-state` داخلی Radix تداخل نکند.
   */
  visualState?: SwitchVisualState;
}) {
  const resolvedChecked =
    visualState != null ? visualState === 'checked' : checked;

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      data-visual-state={visualState}
      checked={resolvedChecked}
      className={cn(
        'group peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-kv-raised transition-colors outline-none',
        'focus-visible:border-kv-brand focus-visible:ring-[3px] focus-visible:ring-kv-ring/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        size === 'default' && 'h-7 w-12',
        size === 'sm' && 'h-5 w-9',
        visualState == null && 'data-[state=checked]:bg-kv-success',
        visualState == null && 'data-[state=unchecked]:bg-kv-border-strong',
        visualState === 'checked' && 'bg-kv-success',
        visualState === 'unchecked' && 'bg-kv-border-strong',
        visualState === 'mixed' &&
          'border-kv-brand-border bg-[color-mix(in_oklab,var(--kv-brand)_40%,var(--kv-border-strong))]',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none absolute top-1/2 block -translate-y-1/2 rounded-full bg-kv-surface shadow-kv-raised ring-0',
          'start-0.5 transition-[inset-inline-start] duration-200 ease-out',
          size === 'default' && 'size-5',
          size === 'sm' && 'size-3.5',
          visualState == null &&
            size === 'default' &&
            'group-data-[state=checked]:start-[calc(100%-1.25rem-0.125rem)]',
          visualState == null &&
            size === 'sm' &&
            'group-data-[state=checked]:start-[calc(100%-0.875rem-0.125rem)]',
          visualState === 'checked' &&
            size === 'default' &&
            'start-[calc(100%-1.25rem-0.125rem)]',
          visualState === 'checked' &&
            size === 'sm' &&
            'start-[calc(100%-0.875rem-0.125rem)]',
          visualState === 'mixed' &&
            size === 'default' &&
            'start-[calc(50%-0.625rem)]',
          visualState === 'mixed' &&
            size === 'sm' &&
            'start-[calc(50%-0.4375rem)]'
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

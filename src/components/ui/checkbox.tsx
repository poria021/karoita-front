'use client';

import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';

import { FaIcon } from '@/components/shared/FaIcon';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer size-4 shrink-0 cursor-pointer rounded-[4px] border border-kv-border-strong shadow-kv-raised transition-shadow outline-none',
        'focus-visible:border-kv-brand focus-visible:ring-[3px] focus-visible:ring-kv-ring/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-kv-danger aria-invalid:ring-kv-ring-danger/20',
        'data-[state=checked]:border-kv-brand data-[state=checked]:bg-kv-brand data-[state=checked]:text-kv-brand-fg',
        'dark:bg-kv-surface dark:data-[state=checked]:bg-kv-brand',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <FaIcon icon={faIcons.check} size="2xs" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };

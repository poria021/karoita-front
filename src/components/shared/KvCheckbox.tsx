'use client';

import * as React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export type KvCheckboxProps = React.ComponentProps<typeof Checkbox>;

/**
 * Karvita checkbox — brand-aligned wrapper over Shadcn Checkbox.
 * Prefer this in app/feature UI instead of raw `Checkbox` or `<input type="checkbox">`.
 */
export function KvCheckbox({ className, ...props }: KvCheckboxProps) {
  return (
    <Checkbox
      data-slot="kv-checkbox"
      className={cn('cursor-pointer', className)}
      {...props}
    />
  );
}

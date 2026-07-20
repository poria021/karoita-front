'use client';

import * as React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export type KvCheckboxProps = React.ComponentProps<typeof Checkbox>;

export function KvCheckbox({ className, ...props }: KvCheckboxProps) {
  return (
    <Checkbox
      data-slot="kv-checkbox"
      className={cn('cursor-pointer', className)}
      {...props}
    />
  );
}

'use client';

import * as React from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type KvLabelProps = React.ComponentProps<typeof Label>;

export function KvLabel({ className, ...props }: KvLabelProps) {
  return (
    <Label
      data-slot="kv-label"
      className={cn(
        'mb-kv-field font-sans text-xs font-bold text-kv-text-muted',
        className
      )}
      {...props}
    />
  );
}

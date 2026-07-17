'use client';

import * as React from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type KvLabelProps = React.ComponentProps<typeof Label>;

/** Karvita form label — bold xs slate, used with selects outside KvTextField. */
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

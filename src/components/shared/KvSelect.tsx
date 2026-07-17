'use client';

import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export {
  Select as KvSelect,
  SelectContent as KvSelectContent,
  SelectItem as KvSelectItem,
  SelectValue as KvSelectValue,
};

export type KvSelectTriggerProps = React.ComponentProps<typeof SelectTrigger>;

/** Karvita-styled select trigger (rounded-xl, bold xs). */
export function KvSelectTrigger({
  className,
  ...props
}: KvSelectTriggerProps) {
  return (
    <SelectTrigger
      data-slot="kv-select-trigger"
      className={cn(
        'h-auto w-full rounded-xl border-slate-300 px-3.5 py-2.5 font-sans text-xs font-bold text-slate-800 shadow-none',
        'focus-visible:border-brand-500 focus-visible:ring-[3px] focus-visible:ring-brand-500/15',
        className
      )}
      {...props}
    />
  );
}

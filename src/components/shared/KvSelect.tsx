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
  SelectValue as KvSelectValue,
};

export type KvSelectTriggerProps = React.ComponentProps<typeof SelectTrigger>;
export type KvSelectContentProps = React.ComponentProps<typeof SelectContent>;
export type KvSelectItemProps = React.ComponentProps<typeof SelectItem>;

/** Karvita-styled select trigger (rounded-kv-control, bold xs). */
export function KvSelectTrigger({
  className,
  ...props
}: KvSelectTriggerProps) {
  return (
    <SelectTrigger
      data-slot="kv-select-trigger"
      className={cn(
        'h-9 w-full rounded-kv-control border-slate-300 px-3 font-sans text-xs font-bold text-slate-800 shadow-none md:text-xs',
        'focus-visible:border-brand-500 focus-visible:ring-[3px] focus-visible:ring-brand-500/15',
        '[&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-slate-400 [&_svg]:opacity-100',
        className
      )}
      {...props}
    />
  );
}

/** Plain dropdown panel — outer border only; options use separators. */
export function KvSelectContent({
  className,
  ...props
}: KvSelectContentProps) {
  return (
    <SelectContent
      data-slot="kv-select-content"
      className={cn(
        'rounded-kv-control border-slate-200 bg-white p-0 shadow-none overflow-hidden',
        'data-[state=open]:animate-none data-[state=closed]:animate-none',
        className
      )}
      {...props}
    />
  );
}

/** Option row with a bottom border separator (no accent chip styling). */
export function KvSelectItem({ className, ...props }: KvSelectItemProps) {
  return (
    <SelectItem
      data-slot="kv-select-item"
      className={cn(
        'rounded-none border-b border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 last:border-b-0',
        'focus:bg-slate-50 focus:text-slate-800',
        className
      )}
      {...props}
    />
  );
}

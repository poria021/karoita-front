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
        'h-9 w-full rounded-kv-control border-kv-border-strong px-3 font-sans text-xs font-bold text-kv-text-secondary shadow-none md:text-xs',
        'focus-visible:border-kv-brand focus-visible:ring-[3px] focus-visible:ring-kv-ring/15',
        '[&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-kv-text-faint [&_svg]:opacity-100',
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
        'rounded-kv-control border-kv-border bg-kv-surface p-0 shadow-none overflow-hidden',
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
        'rounded-none border-b border-kv-border px-3.5 py-2.5 text-xs font-bold text-kv-text-secondary last:border-b-0',
        'focus:bg-kv-surface-muted focus:text-kv-text-secondary',
        className
      )}
      {...props}
    />
  );
}

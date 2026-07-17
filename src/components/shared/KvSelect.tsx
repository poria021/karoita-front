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

/**
 * Karvita select trigger — same chrome as {@link KvTextField} / {@link KvInput}
 * (full width, h-11 default via field, bold xs; hover ≠ focus).
 */
export function KvSelectTrigger({
  className,
  ...props
}: KvSelectTriggerProps) {
  return (
    <SelectTrigger
      data-slot="kv-select-trigger"
      className={cn(
        /* Neutralize Shadcn SelectTrigger defaults that fight field alignment */
        'flex w-full min-w-0 items-center justify-between gap-2 rounded-kv-control',
        'h-11 data-[size=default]:h-11 data-[size=sm]:h-9',
        'border border-kv-border-strong bg-kv-surface px-3.5 py-0',
        'font-sans text-xs font-bold text-kv-text-secondary shadow-none md:text-xs',
        'whitespace-nowrap outline-none',
        'transition-[color,background-color,border-color,box-shadow]',
        'data-[placeholder]:text-kv-text-placeholder',
        /* Hover — border only (no fill change) */
        'hover:border-kv-brand',
        /* Focus / open — solid brand + ring (distinct from hover) */
        'focus-visible:border-kv-brand focus-visible:bg-kv-surface',
        'focus-visible:ring-[3px] focus-visible:ring-kv-ring/15',
        'data-[state=open]:border-kv-brand data-[state=open]:bg-kv-surface',
        'data-[state=open]:ring-[3px] data-[state=open]:ring-kv-ring/15',
        'disabled:cursor-not-allowed disabled:opacity-100',
        'disabled:hover:border-kv-border-strong',
        'dark:bg-kv-surface dark:hover:bg-kv-surface',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        '[&_svg]:text-kv-text-faint [&_svg]:opacity-100',
        '*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex',
        '*:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2',
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

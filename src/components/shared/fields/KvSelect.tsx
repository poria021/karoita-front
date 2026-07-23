'use client';

import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  kvOverlayItemClassName,
  kvOverlayPanelClassName,
} from '@/components/shared/kvOverlayMenu';
import { cn } from '@/lib/utils';

export {
  Select as KvSelect,
  SelectValue as KvSelectValue,
};

export type KvSelectTriggerProps = React.ComponentProps<typeof SelectTrigger>;
export type KvSelectContentProps = React.ComponentProps<typeof SelectContent>;
export type KvSelectItemProps = React.ComponentProps<typeof SelectItem>;

export function KvSelectTrigger({
  className,
  ref,
  ...props
}: KvSelectTriggerProps) {
  return (
    <SelectTrigger
      ref={ref}
      data-slot="kv-select-trigger"
      className={cn(
        'flex w-full min-w-0 items-center justify-between gap-kv-pair rounded-kv-control',
        'h-11 data-[size=default]:h-11 data-[size=sm]:h-9',
        'border border-kv-border-strong bg-kv-surface ps-3.5 pe-2 py-0',
        'font-sans text-xs font-bold text-kv-text-secondary shadow-none md:text-xs',
        'whitespace-nowrap outline-none',
        'transition-[color,background-color,border-color,box-shadow]',
        'data-[placeholder]:text-kv-text-placeholder',
        'focus-visible:border-kv-brand focus-visible:bg-kv-surface',
        'focus-visible:ring-[3px] focus-visible:ring-kv-ring/15',
        'data-[state=open]:border-kv-brand data-[state=open]:bg-kv-surface',
        'data-[state=open]:ring-[3px] data-[state=open]:ring-kv-ring/15',
        'cursor-pointer',
        'disabled:cursor-not-allowed disabled:opacity-100',
        'dark:bg-kv-surface',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        '[&_svg]:text-kv-text-placeholder',
        'disabled:[&_svg]:text-kv-text-disabled',
        '*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex',
        '*:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-kv-pair',
        className
      )}
      {...props}
    />
  );
}

export function KvSelectContent({
  className,
  ...props
}: KvSelectContentProps) {
  return (
    <SelectContent
      data-slot="kv-select-content"
      className={cn(
        kvOverlayPanelClassName,
        'data-[state=open]:animate-none data-[state=closed]:animate-none',
        '[&_[data-slot=select-viewport]]:p-0',
        className
      )}
      {...props}
    />
  );
}

export function KvSelectItem({ className, ...props }: KvSelectItemProps) {
  return (
    <SelectItem
      data-slot="kv-select-item"
      className={cn(
        kvOverlayItemClassName(
          'text-xs font-bold text-kv-text-secondary',
          'focus:bg-kv-surface-muted focus:text-kv-text-secondary'
        ),
        className
      )}
      {...props}
    />
  );
}

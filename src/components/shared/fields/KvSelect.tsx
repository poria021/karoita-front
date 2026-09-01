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
export type KvSelectContentProps = React.ComponentProps<typeof SelectContent> & {
  /** متن نمایشی وقتی هیچ گزینه‌ای وجود ندارد. پیش‌فرض: «موردی یافت نشد.» */
  emptyLabel?: string;
};
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
        'h-11 data-[size=default]:h-11 data-[size=sm]:h-11',
        'border border-kv-border bg-kv-field ps-3.5 pe-2 py-0',
        // مقدار انتخاب‌شده متن اصلی؛ placeholder و شورون کروم آرام می‌مانند.
        'font-sans text-xs font-bold text-kv-text shadow-none md:text-xs',
        'whitespace-nowrap outline-none',
        'transition-[color,background-color,border-color,box-shadow]',
        'data-[placeholder]:text-kv-text-placeholder',
        'can-hover:enabled:not-focus-visible:not-data-[state=open]:hover:border-kv-border-hover',
        'focus-visible:border-kv-brand focus-visible:bg-kv-field',
        'focus-visible:ring-[3px] focus-visible:ring-kv-ring/15',
        'data-[state=open]:border-kv-brand data-[state=open]:bg-kv-field',
        'data-[state=open]:ring-[3px] data-[state=open]:ring-kv-ring/15',
        'data-[state=open]:hover:border-kv-brand',
        'aria-invalid:enabled:not-focus-visible:not-data-[state=open]:hover:border-kv-danger-border',
        'aria-invalid:data-[state=open]:hover:border-kv-danger',
        'cursor-pointer',
        'disabled:cursor-not-allowed disabled:opacity-100 disabled:text-kv-text-disabled',
        'disabled:border-kv-border-disabled disabled:bg-kv-field-disabled',
        'disabled:hover:border-kv-border-disabled',
        'disabled:focus-visible:ring-0 disabled:focus-visible:border-kv-border-disabled',
        'dark:bg-kv-field',
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
  children,
  emptyLabel = 'موردی یافت نشد.',
  ...props
}: KvSelectContentProps) {
  const isEmpty = React.Children.count(children) === 0;

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
    >
      {isEmpty ? (
        <div
          role="status"
          aria-live="polite"
          className="px-kv-group py-3 text-center text-xs text-kv-text-faint"
        >
          {emptyLabel}
        </div>
      ) : (
        children
      )}
    </SelectContent>
  );
}

export function KvSelectItem({ className, ...props }: KvSelectItemProps) {
  return (
    <SelectItem
      data-slot="kv-select-item"
      className={cn(
        kvOverlayItemClassName(
          'text-xs font-bold text-kv-text',
          'focus:bg-kv-surface-muted focus:text-kv-text'
        ),
        className
      )}
      {...props}
    />
  );
}

import * as React from 'react';

import { cn } from '@/lib/utils';

export type KvTableProps = React.ComponentProps<'table'> & {
  /** Wrap table in horizontal scroll container. Default `true`. */
  scrollable?: boolean;
};

/**
 * Lightweight admin table primitives — name/actions and denser data grids.
 * Tokens only (`kv-*`); no feature-local table chrome.
 */
export function KvTable({
  className,
  scrollable = true,
  ...props
}: KvTableProps) {
  const table = (
    <table
      data-slot="kv-table"
      className={cn(
        'w-full border-collapse text-right text-xs font-sans',
        className
      )}
      {...props}
    />
  );

  if (!scrollable) return table;

  return (
    <div data-slot="kv-table-scroll" className="max-w-full overflow-x-auto">
      {table}
    </div>
  );
}

export function KvTableHeader({
  className,
  ...props
}: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="kv-table-header"
      className={cn(
        'sticky top-0 z-10 border-b border-kv-border bg-kv-surface-muted font-bold text-kv-text-subtle',
        className
      )}
      {...props}
    />
  );
}

export function KvTableBody({
  className,
  ...props
}: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="kv-table-body"
      className={cn('divide-y divide-kv-border-muted', className)}
      {...props}
    />
  );
}

export function KvTableRow({
  className,
  ...props
}: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="kv-table-row"
      className={cn(
        'font-bold text-kv-text hover:bg-kv-surface-muted/50',
        className
      )}
      {...props}
    />
  );
}

export function KvTableHead({
  className,
  ...props
}: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="kv-table-head"
      className={cn('p-3.5 text-right font-bold', className)}
      {...props}
    />
  );
}

export function KvTableCell({
  className,
  ...props
}: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="kv-table-cell"
      className={cn('p-3.5', className)}
      {...props}
    />
  );
}

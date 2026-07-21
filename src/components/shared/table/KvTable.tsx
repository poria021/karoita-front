'use client';

import * as React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const ROW_HEIGHT = 'h-12';

const ALIGN_CLASS = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
} as const;

export type KvTableAlign = keyof typeof ALIGN_CLASS;

export type KvTableProps = React.ComponentProps<typeof Table> & {
  scrollable?: boolean;
};

export function KvTable({
  className,
  scrollable = true,
  ...props
}: KvTableProps) {
  const table = (
    <Table
      data-slot="kv-table"
      className={cn(
        'w-full border-separate border-spacing-0 text-start text-xs font-sans',
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
}: React.ComponentProps<typeof TableHeader>) {
  return (
    <TableHeader
      data-slot="kv-table-header"
      className={cn(
        'sticky top-0 z-10 bg-kv-surface-muted font-bold text-kv-text-faint',
        className
      )}
      {...props}
    />
  );
}

export function KvTableBody({
  className,
  ...props
}: React.ComponentProps<typeof TableBody>) {
  return (
    <TableBody
      data-slot="kv-table-body"
      className={cn('[&_tr:last-child>td]:border-b-0', className)}
      {...props}
    />
  );
}

export function KvTableFooter({
  className,
  ...props
}: React.ComponentProps<typeof TableFooter>) {
  return (
    <TableFooter
      data-slot="kv-table-footer"
      className={cn(
        'border-t border-kv-border bg-kv-surface-muted/50 font-bold text-kv-text-faint',
        className
      )}
      {...props}
    />
  );
}

export type KvTableRowProps = React.ComponentProps<typeof TableRow> & {
  interactive?: boolean;
  selected?: boolean;
};

export function KvTableRow({
  className,
  interactive = false,
  selected = false,
  ...props
}: KvTableRowProps) {
  return (
    <TableRow
      data-slot="kv-table-row"
      data-selected={selected || undefined}
      data-interactive={interactive || undefined}
      className={cn(
        'font-bold text-kv-text transition-colors',
        'in-[data-slot=kv-table-body]:hover:bg-kv-surface-muted',
        'data-[selected]:bg-kv-brand-soft data-[selected]:font-extrabold data-[selected]:text-kv-brand',
        'data-[selected]:in-[data-slot=kv-table-body]:hover:bg-kv-brand-soft',
        interactive && 'cursor-pointer',
        className
      )}
      {...props}
    />
  );
}

export type KvTableHeadProps = Omit<
  React.ComponentProps<typeof TableHead>,
  'align'
> & {
  align?: KvTableAlign;
};

export function KvTableHead({
  className,
  align = 'start',
  ...props
}: KvTableHeadProps) {
  return (
    <TableHead
      data-slot="kv-table-head"
      className={cn(
        ROW_HEIGHT,
        'border-b border-kv-border px-3.5 py-0 font-bold whitespace-nowrap',
        ALIGN_CLASS[align],
        className
      )}
      {...props}
    />
  );
}

export type KvTableCellProps = Omit<
  React.ComponentProps<typeof TableCell>,
  'align'
> & {
  align?: KvTableAlign;
  emphasis?: boolean;
  mono?: boolean;
};

export function KvTableCell({
  className,
  align = 'start',
  emphasis = false,
  mono = false,
  ...props
}: KvTableCellProps) {
  return (
    <TableCell
      data-slot="kv-table-cell"
      className={cn(
        ROW_HEIGHT,
        'border-b border-kv-border px-3.5 py-0 whitespace-normal text-kv-text-secondary',
        ALIGN_CLASS[align],
        emphasis && 'font-extrabold text-kv-text',
        mono && 'font-mono',
        className
      )}
      {...props}
    />
  );
}

export function KvTableCaption({
  className,
  ...props
}: React.ComponentProps<typeof TableCaption>) {
  return (
    <TableCaption
      data-slot="kv-table-caption"
      className={cn('text-xs text-kv-text-faint', className)}
      {...props}
    />
  );
}

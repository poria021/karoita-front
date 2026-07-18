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

export type KvTableProps = React.ComponentProps<typeof Table> & {
  /** Wrap table in horizontal scroll container. Default `true`. */
  scrollable?: boolean;
};

/**
 * Product admin table — wraps Shadcn `ui/table` with Karvita tokens.
 */
export function KvTable({
  className,
  scrollable = true,
  ...props
}: KvTableProps) {
  const table = (
    <Table
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
}: React.ComponentProps<typeof TableHeader>) {
  return (
    <TableHeader
      data-slot="kv-table-header"
      className={cn(
        'sticky top-0 z-10 border-b border-kv-border bg-kv-surface-muted font-bold text-kv-text-subtle [&_tr]:border-b-0',
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
      className={cn('divide-y divide-kv-border-muted [&_tr:last-child]:border-0', className)}
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
      className={className}
      {...props}
    />
  );
}

export function KvTableRow({
  className,
  ...props
}: React.ComponentProps<typeof TableRow>) {
  return (
    <TableRow
      data-slot="kv-table-row"
      className={cn(
        'border-b-0 font-bold text-kv-text hover:bg-kv-surface-muted/50',
        className
      )}
      {...props}
    />
  );
}

export function KvTableHead({
  className,
  ...props
}: React.ComponentProps<typeof TableHead>) {
  return (
    <TableHead
      data-slot="kv-table-head"
      className={cn('h-auto p-3.5 text-right font-bold', className)}
      {...props}
    />
  );
}

export function KvTableCell({
  className,
  ...props
}: React.ComponentProps<typeof TableCell>) {
  return (
    <TableCell
      data-slot="kv-table-cell"
      className={cn('p-3.5 whitespace-normal', className)}
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
      className={className}
      {...props}
    />
  );
}

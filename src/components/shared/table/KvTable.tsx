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

export type KvTableAlign = 'start' | 'center' | 'end';

export type KvTableProps = React.ComponentProps<typeof Table> & {
  /** Wrap table in horizontal scroll container. Default `true`. */
  scrollable?: boolean;
};

const ALIGN_CLASS: Record<KvTableAlign, string> = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
};

/**
 * Product admin table — wraps Shadcn `ui/table` with Karvita tokens.
 * Features must compose these exports, not raw `ui/table`.
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
        'w-full border-separate border-spacing-0 text-right text-xs font-sans',
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
        'sticky top-0 z-10 bg-kv-surface-muted font-bold text-kv-text-subtle',
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
        'border-t border-kv-border bg-kv-surface-muted/50 font-bold text-kv-text-subtle',
        className
      )}
      {...props}
    />
  );
}

export type KvTableRowProps = React.ComponentProps<typeof TableRow> & {
  /** Clickable row affordance (pointer + hover already present). */
  interactive?: boolean;
  /** Selected / focused row highlight (no border accent). */
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
        /* Unselected hover: softer brand wash. Selected: solid brand-soft, no hover shift. */
        'hover:bg-kv-brand-soft/45 hover:text-kv-brand',
        'data-[selected]:bg-kv-brand-soft data-[selected]:font-extrabold data-[selected]:text-kv-brand',
        'data-[selected]:hover:bg-kv-brand-soft',
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
        'h-auto border-b border-kv-border p-3.5 font-bold whitespace-nowrap',
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
  /** Strong primary cell (e.g. entity name). */
  emphasis?: boolean;
  /** Monospace for identifiers / phones. */
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
        'border-b border-kv-border p-3.5 whitespace-normal text-kv-text-secondary',
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

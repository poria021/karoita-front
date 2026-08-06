'use client';

import {
  KvTableCell,
  KvTableHead,
  type KvTableCellProps,
  type KvTableHeadProps,
} from '@/components/shared/table/KvTable';
import { adminTableRowNumber } from '@/components/shared/table/adminTableRowNumber';
import { cn } from '@/lib/utils';

const INDEX_COL_CLASS = 'w-14 min-w-14 max-w-14';

export type KvTableRowIndexHeadProps = Omit<KvTableHeadProps, 'align' | 'children'>;

export function KvTableRowIndexHead({
  className,
  ...props
}: KvTableRowIndexHeadProps) {
  return (
    <KvTableHead
      data-slot="kv-table-row-index-head"
      align="center"
      className={cn(INDEX_COL_CLASS, className)}
      {...props}
    >
      ردیف
    </KvTableHead>
  );
}

export type KvTableRowIndexCellProps = Omit<
  KvTableCellProps,
  'align' | 'mono' | 'children'
> & {
  index: number;
  baseOffset?: number;
};

export function KvTableRowIndexCell({
  index,
  baseOffset = 0,
  className,
  ...props
}: KvTableRowIndexCellProps) {
  return (
    <KvTableCell
      data-slot="kv-table-row-index-cell"
      align="center"
      mono
      className={cn(INDEX_COL_CLASS, 'text-kv-text-faint', className)}
      {...props}
    >
      {adminTableRowNumber(index, baseOffset)}
    </KvTableCell>
  );
}

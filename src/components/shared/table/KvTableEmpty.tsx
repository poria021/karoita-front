import type { ReactNode } from 'react';

import { KvTableCell, KvTableRow } from '@/components/shared/table/KvTable';
import { KV_TABLE_EMPTY_FILL_HEIGHT } from '@/components/shared/table/kvTableViewportHeight';
import { cn } from '@/lib/utils';

export type KvTableEmptyProps = {
  colSpan: number;
  children: ReactNode;
  className?: string;
};

export function KvTableEmpty({
  colSpan,
  children,
  className,
}: KvTableEmptyProps) {
  return (
    <KvTableRow className="in-[data-slot=kv-table-body]:hover:bg-transparent">
      <KvTableCell
        colSpan={colSpan}
        align="center"
        className={cn('h-auto min-h-0 p-0', className)}
      >
        <div
          className={cn(
            'flex w-full flex-col',
            KV_TABLE_EMPTY_FILL_HEIGHT
          )}
        >
          {children}
        </div>
      </KvTableCell>
    </KvTableRow>
  );
}

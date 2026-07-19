import type { ReactNode } from 'react';

import { KvTableCell, KvTableRow } from '@/components/shared/table/KvTable';
import { KV_TABLE_EMPTY_FILL_HEIGHT } from '@/components/shared/table/kvTableViewportHeight';
import { cn } from '@/lib/utils';

export type KvTableEmptyProps = {
  /** Must match the visible header column count. */
  colSpan: number;
  /** Usually a {@link KvEmptyState} — domain copy stays in the feature. */
  children: ReactNode;
  className?: string;
};

/**
 * Empty placeholder row inside an admin table body.
 * Keep the table header; host establishes height so {@link KvEmptyState} can fill.
 */
export function KvTableEmpty({
  colSpan,
  children,
  className,
}: KvTableEmptyProps) {
  return (
    <KvTableRow className="hover:bg-transparent">
      <KvTableCell
        colSpan={colSpan}
        align="center"
        className={cn('p-0 hover:bg-transparent', className)}
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

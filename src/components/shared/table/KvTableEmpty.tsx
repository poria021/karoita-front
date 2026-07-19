import type { ReactNode } from 'react';

import { KvTableCell, KvTableRow } from '@/components/shared/table/KvTable';
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
 * Keep the table header; put empty messaging in the body (not a bare empty card).
 * Render inside {@link KvTableViewport} so height stays aligned with loaded lists.
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
        className={cn('py-kv-block hover:bg-transparent', className)}
      >
        {children}
      </KvTableCell>
    </KvTableRow>
  );
}

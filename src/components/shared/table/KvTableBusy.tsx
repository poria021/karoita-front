import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';

export type KvTableBusyProps = {
  colSpan: number;
  className?: string;
  /** Kept for API compatibility; ignored (no row bones). */
  rows?: number;
};

/**
 * First-load busy row — table header stays; body shows a quiet spinner
 * and caption (no skeleton bones). Soft refresh with existing rows stays
 * on `rows` phase and never hits this.
 */
export function KvTableBusy({ colSpan, className }: KvTableBusyProps) {
  return (
    <KvTableEmpty colSpan={colSpan} className={className}>
      <KvBusySurface className="min-h-0 w-full flex-1 bg-transparent p-0" />
    </KvTableEmpty>
  );
}

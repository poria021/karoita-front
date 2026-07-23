import { KvSkeletonTablePanel } from '@/components/shared/skeleton/KvSkeletonCard';
import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';

export type KvTableBusyProps = {
  colSpan: number;
  className?: string;
  /** Skeleton row count — mirrors a typical first page. */
  rows?: number;
};

/**
 * First-load / empty-key busy row — keeps real table header; body shows
 * pulse skeleton rows (not a blank surface). Soft refresh with existing
 * rows stays on `rows` phase and never hits this.
 */
export function KvTableBusy({
  colSpan,
  className,
  rows = 8,
}: KvTableBusyProps) {
  return (
    <KvTableEmpty colSpan={colSpan} className={className}>
      <KvSkeletonTablePanel
        withHeader={false}
        rows={rows}
        heightClassName="min-h-full flex-1"
        label="در حال بارگذاری جدول"
      />
    </KvTableEmpty>
  );
}

import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';

export type KvTableBusyProps = {
  colSpan: number;
  className?: string;
  /** Kept for API compatibility; ignored (no row bones). */
  rows?: number;
};

/**
 * First-load / empty-key busy row — keeps real table header; body stays
 * visually empty (no spinner, no caption) until data arrives, but keeps
 * the same reserved height so rows don't jump in when they load.
 * Soft refresh with existing rows stays on `rows` phase and never hits this.
 */
export function KvTableBusy({ colSpan, className }: KvTableBusyProps) {
  return (
    <KvTableEmpty colSpan={colSpan} className={className}>
      <div
        className="min-h-48 w-full flex-1"
        role="status"
        aria-busy="true"
      />
    </KvTableEmpty>
  );
}

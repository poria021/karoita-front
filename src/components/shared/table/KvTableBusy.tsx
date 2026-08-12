import { Spinner } from '@/components/ui/spinner';

import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';

export type KvTableBusyProps = {
  colSpan: number;
  className?: string;
  /** Kept for API compatibility; ignored (no row bones). */
  rows?: number;
};

/**
 * First-load / empty-key busy row — keeps real table header; body shows a
 * centered spinner. Soft refresh with existing rows stays on `rows` phase
 * and never hits this.
 */
export function KvTableBusy({ colSpan, className }: KvTableBusyProps) {
  return (
    <KvTableEmpty colSpan={colSpan} className={className}>
      <div
        className="flex min-h-48 w-full flex-1 flex-col items-center justify-center gap-kv-pair py-kv-section"
        role="status"
        aria-busy="true"
        aria-label="در حال بارگذاری جدول"
      >
        <Spinner className="size-5 text-kv-brand" aria-hidden="true" />
        <span className="sr-only">در حال بارگذاری جدول</span>
      </div>
    </KvTableEmpty>
  );
}

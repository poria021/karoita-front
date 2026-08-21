import { KvTypography } from '@/components/shared/KvTypography';
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
 * centered spinner with a visible caption. Soft refresh with existing rows
 * stays on `rows` phase and never hits this.
 */
export function KvTableBusy({ colSpan, className }: KvTableBusyProps) {
  return (
    <KvTableEmpty colSpan={colSpan} className={className}>
      <div
        className="flex min-h-48 w-full flex-1 flex-col items-center justify-center gap-kv-pair py-kv-section"
        role="status"
        aria-busy="true"
      >
        <Spinner className="size-5 text-kv-brand" aria-hidden="true" />
        <KvTypography variant="caption" tone="muted">
          در حال دریافت اطلاعات
        </KvTypography>
      </div>
    </KvTableEmpty>
  );
}

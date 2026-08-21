'use client';

import { KvTypography } from '@/components/shared/KvTypography';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

import { KV_TABLE_VIEWPORT_HEIGHT } from '@/components/shared/table/kvTableViewportHeight';

export type KvBusySurfaceProps = {
  tableViewport?: boolean;
  className?: string;
  label?: string;
};

/**
 * Local data-region busy. Chrome stays painted; wait feedback is a quiet
 * spinner with a visible caption (no skeleton bones). Soft refresh with
 * existing content should keep prior UI and not mount this.
 */
export function KvBusySurface({
  tableViewport = false,
  className,
  label = 'در حال دریافت اطلاعات',
}: KvBusySurfaceProps) {
  return (
    <div
      data-slot="kv-busy-surface"
      className={cn(
        'flex w-full flex-col items-center justify-center gap-kv-pair bg-kv-surface p-kv-group',
        tableViewport ? KV_TABLE_VIEWPORT_HEIGHT : 'min-h-40 bg-kv-canvas',
        className
      )}
      aria-busy="true"
      role="status"
      aria-label={label}
    >
      <Spinner className="size-5 text-kv-brand" aria-hidden="true" />
      <KvTypography variant="caption" tone="muted">
        {label}
      </KvTypography>
    </div>
  );
}

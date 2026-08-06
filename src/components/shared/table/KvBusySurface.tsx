import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { cn } from '@/lib/utils';

import { KV_TABLE_VIEWPORT_HEIGHT } from '@/components/shared/table/kvTableViewportHeight';

export type KvBusySurfaceProps = {
  tableViewport?: boolean;
  className?: string;
};

/**
 * Local data-region busy. Chrome stays painted; this surface shows quiet
 * skeleton bones so the wait does not read as a blank unfinished panel.
 */
export function KvBusySurface({
  tableViewport = false,
  className,
}: KvBusySurfaceProps) {
  return (
    <div
      data-slot="kv-busy-surface"
      className={cn(
        'flex w-full flex-col gap-kv-group bg-kv-surface p-kv-group',
        tableViewport ? KV_TABLE_VIEWPORT_HEIGHT : 'min-h-40 bg-kv-canvas',
        className
      )}
      aria-busy="true"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <div className="flex items-center justify-between gap-kv-group">
        <KvSkeleton className="h-3 w-28" />
        <KvSkeleton className="h-3 w-16" />
      </div>
      <div className="flex flex-col gap-kv-pair">
        <KvSkeleton className="h-9 w-full" />
        <KvSkeleton className="h-9 w-full" />
        <KvSkeleton className="h-9 w-[88%]" />
        <KvSkeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

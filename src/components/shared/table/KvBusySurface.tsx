import { cn } from '@/lib/utils';

import { KV_TABLE_VIEWPORT_HEIGHT } from '@/components/shared/table/kvTableViewportHeight';

export type KvBusySurfaceProps = {
  tableViewport?: boolean;
  className?: string;
};

export function KvBusySurface({
  tableViewport = false,
  className,
}: KvBusySurfaceProps) {
  return (
    <div
      data-slot="kv-busy-surface"
      className={cn(
        'w-full bg-kv-surface',
        tableViewport ? KV_TABLE_VIEWPORT_HEIGHT : 'min-h-40 bg-kv-canvas',
        className
      )}
      aria-busy="true"
    />
  );
}

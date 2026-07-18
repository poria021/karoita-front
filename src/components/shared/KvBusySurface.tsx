import { KV_TABLE_VIEWPORT_HEIGHT } from '@/components/shared/kvTableViewportHeight';
import { cn } from '@/lib/utils';

export type KvBusySurfaceProps = {
  /** Match admin table viewport height. */
  tableViewport?: boolean;
  className?: string;
};

/**
 * Plain busy placeholder — no skeleton shapes (rule 80).
 */
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

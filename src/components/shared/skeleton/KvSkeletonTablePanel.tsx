import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { KV_TABLE_VIEWPORT_HEIGHT } from '@/components/shared/table/kvTableViewportHeight';
import { cn } from '@/lib/utils';

export type KvSkeletonTablePanelProps = {
  className?: string;
  rows?: number;
  withHeader?: boolean;
  label?: string;
};

/**
 * Table-shaped cold placeholder — only pulse bones (shadcn), no bordered card.
 */
export function KvSkeletonTablePanel({
  className,
  rows = 6,
  withHeader = true,
  label = 'در حال بارگذاری جدول',
}: KvSkeletonTablePanelProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col justify-start gap-3',
        KV_TABLE_VIEWPORT_HEIGHT,
        className
      )}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      {withHeader ? (
        <div className="flex items-center gap-3">
          <KvSkeleton className="h-4 w-24" />
          <KvSkeleton className="h-4 w-20" />
          <KvSkeleton className="ms-auto h-4 w-16" />
        </div>
      ) : null}
      {Array.from({ length: rows }, (_, i) => (
        <KvSkeleton key={i} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );
}

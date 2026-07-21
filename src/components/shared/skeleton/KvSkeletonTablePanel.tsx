import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { KV_TABLE_VIEWPORT_HEIGHT } from '@/components/shared/table/kvTableViewportHeight';
import { cn } from '@/lib/utils';

export type KvSkeletonTablePanelProps = {
  className?: string;
  rows?: number;
  withHeader?: boolean;
  /** Override default admin viewport height (e.g. syllabus weeks max-h). */
  heightClassName?: string;
  /** Column bone widths for the header row (RTL visual order). */
  headerCols?: string[];
  label?: string;
};

/**
 * Table-shaped cold placeholder — pulse bones only (no outer card).
 * Parent should supply KvCard / viewport chrome to match the live page.
 */
export function KvSkeletonTablePanel({
  className,
  rows = 6,
  withHeader = true,
  heightClassName = KV_TABLE_VIEWPORT_HEIGHT,
  headerCols = ['w-24', 'w-20', 'w-16'],
  label = 'در حال بارگذاری جدول',
}: KvSkeletonTablePanelProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col justify-start gap-3 p-kv-pair',
        heightClassName,
        className
      )}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      {withHeader ? (
        <div className="flex items-center gap-3 border-b border-kv-border-muted pb-3">
          {headerCols.map((colWidth, index) => (
            <KvSkeleton
              key={index}
              className={cn(
                'h-4 rounded-md',
                colWidth,
                index === headerCols.length - 1 && 'ms-auto'
              )}
            />
          ))}
        </div>
      ) : null}
      {Array.from({ length: rows }, (_, i) => (
        <KvSkeleton key={i} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );
}

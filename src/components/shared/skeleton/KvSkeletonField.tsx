import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { cn } from '@/lib/utils';

export type KvSkeletonFieldProps = {
  className?: string;
  /** Approximate label width */
  labelClassName?: string;
  /** Control height — default matches KvTextField md (`h-11`) */
  controlClassName?: string;
};

/**
 * Mirrors `KvFieldFrame` + control: label (`mb-kv-field`) then input/select bone.
 */
export function KvSkeletonField({
  className,
  labelClassName,
  controlClassName,
}: KvSkeletonFieldProps) {
  return (
    <div className={cn('w-full space-y-kv-field', className)} aria-hidden>
      <KvSkeleton className={cn('h-3.5 w-24 rounded-kv-control', labelClassName)} />
      <KvSkeleton
        className={cn('h-11 w-full rounded-kv-control', controlClassName)}
      />
    </div>
  );
}

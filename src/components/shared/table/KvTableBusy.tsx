import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';

export type KvTableBusyProps = {
  colSpan: number;
  className?: string;
};

/**
 * First-load busy row inside an admin table body.
 * Keeps header chrome; fills the body with a plain surface (no skeleton).
 */
export function KvTableBusy({ colSpan, className }: KvTableBusyProps) {
  return (
    <KvTableEmpty colSpan={colSpan} className={className}>
      <KvBusySurface className="min-h-full flex-1 bg-kv-surface" />
    </KvTableEmpty>
  );
}

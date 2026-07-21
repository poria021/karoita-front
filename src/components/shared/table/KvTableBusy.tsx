import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';

export type KvTableBusyProps = {
  colSpan: number;
  className?: string;
};

/** First-load busy row — keeps header; plain surface in body. */
export function KvTableBusy({ colSpan, className }: KvTableBusyProps) {
  return (
    <KvTableEmpty colSpan={colSpan} className={className}>
      <KvBusySurface className="min-h-full flex-1 bg-kv-surface" />
    </KvTableEmpty>
  );
}

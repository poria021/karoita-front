import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';

export type KvTableBusyProps = {
  colSpan: number;
  className?: string;
  /** برای سازگاری API مانده؛ نادیده گرفته می‌شود (بدون استخوان ردیف). */
  rows?: number;
};

/**
 * ردیف busy بار اول — هدر جدول می‌ماند؛ بدنه اسپینر آرام و توضیح است (بدون اسکلتون).
 * رفرش نرم با ردیف موجود روی فاز `rows` می‌ماند و به اینجا نمی‌رسد.
 */
export function KvTableBusy({ colSpan, className }: KvTableBusyProps) {
  return (
    <KvTableEmpty colSpan={colSpan} className={className}>
      <KvBusySurface className="min-h-0 w-full flex-1 bg-transparent p-0" />
    </KvTableEmpty>
  );
}

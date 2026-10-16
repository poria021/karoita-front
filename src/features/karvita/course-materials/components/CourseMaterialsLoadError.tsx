'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';

/**
 * خطای خواندن فایل‌های درس. قبلاً (وقتی endpoint نبود) باکس بی‌صدا پنهان
 * می‌شد؛ حالا که real وصل است، پنهان‌شدن یعنی کاربر نمی‌فهمد مشکلی هست.
 */
export function CourseMaterialsLoadError({
  onRetry,
  retrying,
}: {
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <KvAlert
      variant="error"
      title="فایل‌های درس بارگذاری نشد"
      description="ارتباط با سرور برقرار نشد یا پاسخ نامعتبر بود. دوباره تلاش کنید."
      actions={
        <KvButton
          type="button"
          size="sm"
          appearance="secondary"
          loading={retrying}
          onClick={onRetry}
        >
          تلاش دوباره
        </KvButton>
      }
    />
  );
}

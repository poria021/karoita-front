'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import { faIcons } from '@/utils/iconMap';

/**
 * سناریوی ۴ — ثبت‌نام موفق؛ انتظار شروع رسمی ترم.
 * امپتی‌استیت تمام‌ارتفاع (بدون جدول گزارش).
 */
export function ScenarioRegisteredWaiting() {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-kv-card border-2 border-dashed border-kv-success-border bg-kv-success-soft/30">
      <div
        className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center gap-kv-group px-kv-inset py-kv-block text-center"
        role="status"
      >
        <div
          className="flex shrink-0 items-center justify-center text-kv-success"
          aria-hidden
        >
          <FaIcon icon={faIcons.circleCheck} size="xl" />
        </div>
        <div className="max-w-md space-y-kv-pair">
          <KvTypography variant="title" as="h2">
            انتخاب واحد شما با موفقیت انجام شد
          </KvTypography>
          <KvTypography variant="body" tone="muted" as="p">
            کاربر گرامی، فرآیند انتخاب واحد شما با موفقیت به اتمام رسیده است. به
            محض شروع رسمی ترم تحصیلی، فرآیند گزارش‌نویسی هفتگی برای شما فعال
            خواهد شد.
          </KvTypography>
        </div>
      </div>
    </div>
  );
}

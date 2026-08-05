'use client';

import { KvEmptyState } from '@/components/shared/KvEmptyState';

/**
 * سناریوی ۲ — مهلت انتخاب واحد گذشته / ترم در جریان بدون ثبت‌نام.
 * امپتی خطر (قرمز کمرنگ)؛ بدون جدول گزارش هفتگی.
 */
export function ScenarioEnrollClosed() {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-kv-card border-2 border-dashed border-kv-danger-border bg-kv-danger-soft/50">
      <KvEmptyState
        tone="danger"
        title="مهلت انتخاب واحد به پایان رسیده است"
        description="کاربر گرامی، شما در این دوره ثبت‌نام نکرده‌اید و امکان ارسال گزارش وجود ندارد. پس از فعال‌سازی مجدد درگاه توسط مدیریت آموزشی می‌توانید اقدام کنید."
      />
    </div>
  );
}

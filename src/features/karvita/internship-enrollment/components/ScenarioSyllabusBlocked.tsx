'use client';

import { KvEmptyState } from '@/components/shared/KvEmptyState';

/** سناریوی ۱ — سرفصل فعال نشده؛ درگاه مسدود. */
export function ScenarioSyllabusBlocked() {
  return (
    <div className="rounded-kv-card border-2 border-dashed border-kv-border bg-kv-surface-subtle/50">
      <KvEmptyState
        tone="danger"
        title="درگاه انتخاب واحد مسدود است"
        description="مدیریت آموزشی هنوز سرفصل‌های این درس را برای نیم‌سال جاری فعال نکرده است. لطفا تا زمان ارائه رسمی صبور باشید."
      />
    </div>
  );
}

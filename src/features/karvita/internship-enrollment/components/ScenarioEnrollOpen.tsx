'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import { faIcons } from '@/utils/iconMap';

/**
 * سناریوی ۳ — مهلت ثبت‌نام باز؛ هنوز انتخاب واحد نشده.
 * امپتی‌استیت تمام‌ارتفاع (ویزارد ناظر — Phase 2).
 */
export function ScenarioEnrollOpen() {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-kv-card border-2 border-dashed border-kv-border bg-kv-surface-subtle/50">
      <div
        className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center gap-kv-group px-kv-inset py-kv-block text-center"
        role="status"
      >
        <div
          className="flex shrink-0 items-center justify-center text-kv-brand"
          aria-hidden
        >
          <FaIcon icon={faIcons.graduationCap} size="xl" />
        </div>
        <div className="max-w-md space-y-kv-pair">
          <KvTypography variant="title" as="h2">
            زمان شروع انتخاب واحد فرارسیده
          </KvTypography>
          <KvTypography variant="body" tone="muted" as="p">
            درگاه رسمی انتخاب واحد و رزرو ظرفیت اساتید راهنما برای نیم‌سال جاری
            فعال گردیده است.
          </KvTypography>
        </div>
      </div>
    </div>
  );
}

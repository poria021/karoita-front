'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

type ScenarioEnrollClosedProps = {
  weekCount: number;
};

/** سناریوی ۲ — مهلت ثبت‌نام گذشته؛ پیش‌نمایش قفل‌شدهٔ هفته‌ها. */
export function ScenarioEnrollClosed({ weekCount }: ScenarioEnrollClosedProps) {
  const weeks = Array.from({ length: weekCount }, (_, i) => i + 1);

  return (
    <div className="space-y-kv-group">
      <KvAlert
        variant="warning"
        title="مهلت انتخاب واحد به پایان رسیده است"
        description="کاربر گرامی، شما در این دوره ثبت‌نام نکرده‌اید و امکان ارسال گزارش وجود ندارد، اما جدول هفتگی و ساختار دوره جهت مشاهده برای شما باز است."
      />

      <KvCard padding="sm" className="space-y-kv-group">
        <div className="flex flex-wrap items-center justify-between gap-kv-inline">
          <KvTypography variant="subtitle" as="h3">
            پیش‌نمایش ساختار جلسات هفتگی
          </KvTypography>
          <KvButton
            type="button"
            appearance="secondary"
            size="sm"
            disabled
            aria-disabled="true"
            icon={<FaIcon icon={faIcons.filePdf} size="xs" />}
          >
            دانلود کارنامه (PDF)
          </KvButton>
        </div>

        <div
          className="grid grid-cols-2 gap-kv-pair sm:grid-cols-3 lg:grid-cols-4"
          aria-label="پیش‌نمایش هفته‌های قفل‌شده"
        >
          {weeks.map((week) => (
            <div
              key={week}
              className="flex min-h-24 flex-col justify-between rounded-kv-panel border border-kv-border bg-kv-surface-subtle/50 p-kv-field opacity-60 select-none"
            >
              <div className="flex w-full items-center justify-between">
                <KvTypography variant="caption" tone="muted" as="span">
                  {`هفته ${toPersianDigits(week)}`}
                </KvTypography>
                <FaIcon
                  icon={faIcons.lock}
                  size="xs"
                  className="text-kv-text-subtle"
                />
              </div>
              <KvTypography variant="caption" tone="muted" as="span">
                غیرقابل ثبت گزارش
              </KvTypography>
            </div>
          ))}
        </div>
      </KvCard>
    </div>
  );
}

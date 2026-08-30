'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvScrollArea } from '@/components/shared/KvScrollArea';
import { KvTypography } from '@/components/shared/KvTypography';
import type { DailyApprovalWeek } from '@/types/daily-approvals';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

type DailyApprovalWeekReportReadonlyProps = {
  week: DailyApprovalWeek;
};

export function DailyApprovalWeekReportReadonly({
  week,
}: DailyApprovalWeekReportReadonlyProps) {
  const reportText =
    week.text.trim() ||
    'هنوز گزارشی توسط فراگیر ثبت نشده یا به صورت پیش‌نویس است.';

  return (
    <div className="space-y-kv-group">
      <div className="space-y-kv-pair">
        <KvTypography variant="subtitle" as="h4">
          ۱. متن کامل گزارش ارسالی فراگیر:
        </KvTypography>
        <KvScrollArea className="max-h-36 overflow-y-auto rounded-kv-control border border-kv-border bg-kv-surface-muted p-kv-group text-justify">
          <KvTypography variant="body" as="p">
            {reportText}
          </KvTypography>
        </KvScrollArea>
      </div>

      <div className="space-y-kv-pair">
        <KvTypography variant="caption" tone="muted" as="h4">
          ضمائم و پیوست‌های گزارش:
        </KvTypography>
        {week.files.length > 0 ? (
          <ul className="grid grid-cols-1 gap-kv-pair sm:grid-cols-2">
            {week.files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between gap-kv-group rounded-kv-control border border-kv-border bg-kv-surface p-kv-group shadow-kv-soft"
              >
                <div className="flex min-w-0 items-center gap-kv-pair">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-kv-control border border-kv-border bg-kv-surface-muted text-kv-danger">
                    <FaIcon icon={faIcons.filePdf} size="xs" />
                  </span>
                  <div className="min-w-0">
                    <KvTypography variant="subtitle" as="p" truncate>
                      {toPersianDigits(file.name)}
                    </KvTypography>
                    <KvTypography variant="caption" tone="muted">
                      {toPersianDigits(file.sizeMb.toFixed(1))} مگابایت
                    </KvTypography>
                  </div>
                </div>
                {file.url ? (
                  <KvButton
                    asChild
                    color="neutral"
                    appearance="secondary"
                    size="icon-sm"
                  >
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="دانلود فایل"
                    >
                      <FaIcon icon={faIcons.download} size="xs" />
                    </a>
                  </KvButton>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-kv-control border border-dashed border-kv-border bg-kv-surface-muted p-kv-group text-center">
            <KvTypography variant="caption" tone="muted" weight="bold">
              هیچ ضمیمه‌ای برای این گزارش ارسال نشده است.
            </KvTypography>
          </div>
        )}
      </div>
    </div>
  );
}

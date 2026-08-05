'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvCard } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import type { InternshipEnrollmentSummary } from '@/types/internship-enrollment';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

type ScenarioRegisteredWaitingProps = {
  enrollment: InternshipEnrollmentSummary;
};

const UNSET = 'مشخص نشده';

function DetailCell({
  label,
  value,
  pending,
}: {
  label: string;
  value: string;
  pending?: boolean;
}) {
  return (
    <div className="flex flex-col gap-kv-pair rounded-kv-panel border border-kv-border bg-kv-surface-subtle p-kv-field">
      <KvTypography variant="caption" tone="muted" as="span">
        {label}
      </KvTypography>
      <KvTypography
        variant="label"
        tone={pending ? 'danger' : 'default'}
        as="span"
        weight="black"
      >
        {value}
      </KvTypography>
    </div>
  );
}

/** سناریوی ۴ — ثبت‌نام موفق؛ انتظار شروع رسمی ترم. */
export function ScenarioRegisteredWaiting({
  enrollment,
}: ScenarioRegisteredWaitingProps) {
  const supervisor = enrollment.supervisorName?.trim() || 'نامشخص';
  const school = enrollment.schoolName?.trim() || UNSET;
  const mentor = enrollment.mentorName?.trim() || UNSET;
  const days = enrollment.attendanceDaysLabel || UNSET;

  return (
    <div className="space-y-kv-group">
      <div
        className="flex flex-col items-center justify-center gap-kv-group rounded-kv-card border-2 border-dashed border-kv-success-border bg-kv-success-soft/30 px-kv-inset py-kv-block text-center"
        role="status"
      >
        <div
          className="flex items-center justify-center text-kv-success"
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
          <KvTypography variant="caption" tone="muted" as="p">
            {toPersianDigits(
              `${enrollment.courseTitle} — ${enrollment.termTitle}`
            )}
          </KvTypography>
        </div>
      </div>

      <KvCard padding="md" className="space-y-kv-group text-start">
        <div className="flex items-center gap-kv-inline border-b border-kv-border pb-kv-field">
          <FaIcon
            icon={faIcons.school}
            size="sm"
            className="text-kv-brand"
          />
          <KvTypography variant="subtitle" as="h3">
            جزئیات کلاس اخذ شده (در انتظار شروع ترم)
          </KvTypography>
        </div>

        <div className="grid grid-cols-1 gap-kv-pair sm:grid-cols-2 lg:grid-cols-4">
          <DetailCell label="استاد راهنما:" value={supervisor} />
          <DetailCell label="روز های حضور:" value={days} pending />
          <DetailCell label="مدرسه:" value={school} pending />
          <DetailCell label="معلم راهنما:" value={mentor} pending />
        </div>
      </KvCard>
    </div>
  );
}

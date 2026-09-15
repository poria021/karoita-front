'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import type { InternshipEnrollmentSummary } from '@/types/internship-enrollment';
import { faIcons } from '@/utils/iconMap';

type ScenarioRegisteredWaitingProps = {
  enrollment: InternshipEnrollmentSummary;
  onCancel?: () => Promise<void>;
};

const UNSET = 'مشخص نشده';

/** چرا روز حضور استاد نامشخص مانده — برای یک تولتیپ روشن به‌جای سکوت. */
const ATTENDANCE_DAYS_UNAVAILABLE_HINT: Record<
  NonNullable<InternshipEnrollmentSummary['attendanceDaysUnavailableReason']>,
  string
> = {
  'capacity-exhausted':
    'ظرفیت این استاد تکمیل شده و دیگر در فهرست ثبت‌نام نیست؛ روز حضور از این طریق در دسترس نبود.',
  error: 'در دریافت روز حضور خطایی رخ داد؛ لطفاً بعداً دوباره امتحان کنید.',
};

function DetailCell({
  label,
  value,
  pending,
  hint,
}: {
  label: string;
  value: string;
  pending?: boolean;
  hint?: string;
}) {
  return (
    <div
      className="flex flex-col gap-kv-pair rounded-kv-panel border border-kv-border bg-kv-surface-subtle p-kv-field"
      title={hint}
    >
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

/**
 * سناریوی ۴ — ثبت‌نام موفق؛ انتظار شروع رسمی ترم.
 * امپتی سبز + کارت جزئیات کلاس (استاد / روز / مدرسه / معلم).
 */
export function ScenarioRegisteredWaiting({
  enrollment,
  onCancel,
}: ScenarioRegisteredWaitingProps) {
  const supervisor = enrollment.supervisorName?.trim() || 'نامشخص';
  const school = enrollment.schoolName?.trim() || UNSET;
  const mentor = enrollment.mentorName?.trim() || UNSET;
  const days = enrollment.attendanceDaysLabel || UNSET;
  const daysHint =
    days === UNSET && enrollment.attendanceDaysUnavailableReason
      ? ATTENDANCE_DAYS_UNAVAILABLE_HINT[enrollment.attendanceDaysUnavailableReason]
      : undefined;
  const [isCancelling, setIsCancelling] = useState(false);

  async function handleCancel() {
    if (!onCancel) return;
    setIsCancelling(true);
    try {
      await onCancel();
      toast.success('ثبت‌نام با موفقیت لغو شد.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'لغو ثبت‌نام ناموفق بود.'
      );
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-kv-group">
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

      <KvCard padding="md" className="shrink-0 space-y-kv-group text-start">
        <div className="flex items-center gap-kv-inline border-b border-kv-border pb-kv-field">
          <FaIcon icon={faIcons.school} size="sm" className="text-kv-brand" />
          <KvTypography variant="subtitle" as="h3">
            جزئیات کلاس اخذ شده (در انتظار شروع ترم)
          </KvTypography>
        </div>

        <div className="grid grid-cols-1 gap-kv-pair sm:grid-cols-2 lg:grid-cols-4">
          <DetailCell label="استاد راهنما:" value={supervisor} />
          <DetailCell
            label="روز های استاد:"
            value={days}
            pending={days === UNSET}
            hint={daysHint}
          />
          <DetailCell label="مدرسه:" value={school} pending={school === UNSET} />
          <DetailCell label="معلم راهنما:" value={mentor} pending={mentor === UNSET} />
        </div>

        {onCancel ? (
          <div className="flex justify-end border-t border-kv-border pt-kv-field">
            <KvButton
              type="button"
              color="error"
              appearance="ghost"
              size="sm"
              loading={isCancelling}
              icon={<FaIcon icon={faIcons.xmark} size="xs" />}
              onClick={() => void handleCancel()}
            >
              لغو ثبت‌نام
            </KvButton>
          </div>
        ) : null}
      </KvCard>
    </div>
  );
}

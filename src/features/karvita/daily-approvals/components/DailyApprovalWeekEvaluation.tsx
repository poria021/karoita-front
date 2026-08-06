'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvTextArea } from '@/components/shared/fields/KvTextArea';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
import type {
  DailyApprovalTrainee,
  DailyApprovalWeek,
} from '@/types/daily-approvals';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

type DailyApprovalWeekEvaluationProps = {
  trainee: DailyApprovalTrainee;
  week: DailyApprovalWeek;
  advisorFeedback: string;
  scoreInput: string;
  actionBusy: boolean;
  onAdvisorFeedbackChange: (value: string) => void;
  onScoreInputChange: (value: string) => void;
  onSave: () => void;
  onExtend: () => void;
  onClose: () => void;
};

export function DailyApprovalWeekEvaluation({
  trainee,
  week,
  advisorFeedback,
  scoreInput,
  actionBusy,
  onAdvisorFeedbackChange,
  onScoreInputChange,
  onSave,
  onExtend,
  onClose,
}: DailyApprovalWeekEvaluationProps) {
  const dropped = trainee.status === 'dropped';
  const saveLabel =
    scoreInput.trim() === ''
      ? 'ثبت بازخورد اصلاحی'
      : 'ثبت و تایید نهایی نمره';

  return (
    <section className="space-y-kv-group rounded-kv-panel border border-kv-border bg-kv-surface p-kv-section shadow-kv-raised">
      <div className="flex items-start justify-between gap-kv-group border-b border-kv-border pb-kv-group">
        <div>
          <KvTypography variant="subtitle" as="h3">
            ثبت ارزشیابی کارورز - {trainee.traineeName}
          </KvTypography>
          <KvTypography variant="caption" tone="muted">
            ارزیابی هفته {toPersianDigits(week.weekNumber)} -{' '}
            {toPersianDigits(trainee.courseTitle)}
          </KvTypography>
        </div>
        <KvButton
          type="button"
          color="neutral"
          appearance="ghost"
          size="icon-sm"
          aria-label="بستن ارزیابی هفته"
          onClick={onClose}
          icon={<FaIcon icon={faIcons.xmark} size="sm" />}
        />
      </div>

      {dropped ? (
        <KvAlert
          variant="error"
          title="این کارورز از کلاس آموزشی اخراج شده است!"
          description="به علت اخراج تحصیلی توسط استاد راهنما، فرآیند ارزیابی این کارورز متوقف و پنل ارزیابی فریز گردیده است."
        />
      ) : null}

      <fieldset disabled={dropped || actionBusy} className="space-y-kv-group">
        <div className="space-y-kv-pair">
          <KvTypography variant="subtitle" as="h4">
            ۱. متن کامل گزارش ارسالی فراگیر:
          </KvTypography>
          <div className="max-h-36 overflow-y-auto rounded-kv-control border border-kv-border bg-kv-surface-muted p-kv-group">
            <KvTypography variant="body" as="p">
              {week.text.trim() || 'برای این هفته هنوز متن گزارشی ارسال نشده است.'}
            </KvTypography>
          </div>
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
                    <KvButton asChild color="neutral" appearance="secondary" size="icon-sm">
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
            <div className="rounded-kv-control border border-dashed border-kv-border bg-kv-surface-muted p-kv-group text-center text-xs font-bold text-kv-text-faint">
              هیچ ضمیمه‌ای برای این گزارش ارسال نشده است.
            </div>
          )}
        </div>

        {week.feedback.mentor ? (
          <KvAlert
            variant="warning"
            title="بازخورد معلم راهنما"
            description={week.feedback.mentor}
            icon={<FaIcon icon={faIcons.chalkboardUser} size="sm" />}
          />
        ) : null}
        {week.feedback.principal ? (
          <KvAlert
            variant="success"
            title="بازخورد مدیر مدرسه"
            description={week.feedback.principal}
            icon={<FaIcon icon={faIcons.school} size="sm" />}
          />
        ) : null}

        <KvTextField
          label="نمره علمی از ۱۰۰"
          type="text"
          inputMode="decimal"
          value={toPersianDigits(scoreInput)}
          placeholder="مثلاً ۸۷"
          maxLength={5}
          onChange={(event) => onScoreInputChange(event.target.value)}
        />

        <KvTextArea
          label="بازخورد استاد راهنما"
          value={advisorFeedback}
          rows={4}
          maxLength={1200}
          placeholder="نقاط قوت، موارد اصلاحی یا جمع‌بندی علمی هفته را بنویسید..."
          onChange={(event) => onAdvisorFeedbackChange(event.target.value)}
        />
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-kv-pair border-t border-kv-border pt-kv-group">
        <KvButton
          type="button"
          color="neutral"
          appearance="secondary"
          size="sm"
          disabled={actionBusy}
          onClick={onClose}
        >
          لغو
        </KvButton>
        <div className="flex flex-wrap items-center gap-kv-pair">
          <KvButton
            type="button"
            color="cta"
            appearance="secondary"
            size="sm"
            disabled={
              actionBusy || dropped || week.status === 'graded'
            }
            loading={actionBusy}
            icon={<FaIcon icon={faIcons.unlockKeyhole} size="xs" />}
            onClick={onExtend}
          >
            تمدید مهلت (بازگشایی قفل کارت)
          </KvButton>
          <KvButton
            type="button"
            color={scoreInput.trim() === '' ? 'warning' : 'success'}
            appearance="solid"
            size="sm"
            disabled={actionBusy || dropped}
            loading={actionBusy}
            onClick={onSave}
          >
            {saveLabel}
          </KvButton>
        </div>
      </div>
    </section>
  );
}

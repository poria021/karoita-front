'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvScrollArea } from '@/components/shared/KvScrollArea';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvDialog,
  KvDialogContent,
  KvDialogDescription,
  KvDialogFooter,
  KvDialogHeader,
  KvDialogTitle,
} from '@/components/shared/KvDialog';
import { KvMultiFileDropzone } from '@/components/shared/fields/KvMultiFileDropzone';
import { KvTextArea } from '@/components/shared/fields/KvTextArea';
import { KvTypography } from '@/components/shared/KvTypography';
import { useWeeklyReportModal } from '@/features/karvita/internship-enrollment/hooks/useWeeklyReportModal';
import { competencyRatingLabel } from '@/features/karvita/daily-approvals/constants';
import {
  WEEKLY_REPORT_ACCEPT,
  WEEKLY_REPORT_ACCEPT_LABEL,
  WEEKLY_REPORT_INVALID_TYPE_MESSAGE,
  WEEKLY_REPORT_MAX_FILE_SIZE_MB,
  WEEKLY_REPORT_MAX_TOTAL_SIZE_MB,
} from '@/services/internship-enrollment/weekly-report-attachment-limits';
import type {
  InternshipCompetencyRating,
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
  InternshipWeeklySession,
} from '@/types/internship-enrollment';
import { faIcons } from '@/utils/iconMap';
import { formatJalaliDateTimeDisplay } from '@/utils/formatJalaliDate';

type WeeklyReportModalProps = {
  open: boolean;
  week: InternshipWeeklySession | null;
  actor: InternshipEnrollmentActor;
  state: InternshipEnrollmentPageState;
  onClose: () => void;
  onReopen: (week: InternshipWeeklySession) => void;
  onSaved: () => Promise<void>;
};

function FeedbackBlock({
  title,
  icon,
  body,
  rating,
  at,
}: {
  title: string;
  icon: (typeof faIcons)[keyof typeof faIcons];
  body: string;
  rating?: InternshipCompetencyRating;
  at?: string;
}) {
  const atLabel = formatJalaliDateTimeDisplay(at);
  return (
    <KvAlert
      variant="warning"
      title={title}
      icon={<FaIcon icon={icon} size="sm" />}
      description={
        <div className="flex flex-col gap-kv-pair">
          {rating ? (
            <KvTypography variant="body" as="p" weight="bold">
              سطح شایستگی: {competencyRatingLabel(rating)}
            </KvTypography>
          ) : null}
          <KvTypography variant="body" as="p">
            {body}
          </KvTypography>
          {atLabel ? (
            <KvTypography variant="caption" tone="muted" as="p">
              {atLabel}
            </KvTypography>
          ) : null}
        </div>
      }
    />
  );
}

export function WeeklyReportModal({
  open,
  week,
  actor,
  state,
  onClose,
  onReopen,
  onSaved,
}: WeeklyReportModalProps) {
  const modal = useWeeklyReportModal({
    actor,
    state,
    week,
    open,
    onClose,
    onReopen,
    onSaved,
  });

  return (
    <KvDialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          modal.resetForm();
        }
        if (!next && !modal.busy) onClose();
      }}
    >
      <KvDialogContent
        size="lg"
        className="max-w-[640px]"
        showCloseButton
        onPointerDownOutside={(event) => {
          if (modal.busy) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (modal.busy) event.preventDefault();
        }}
      >
        <KvDialogHeader>
          <KvDialogTitle>{modal.title}</KvDialogTitle>
          <KvDialogDescription className="sr-only">
            ویرایش یا مشاهده گزارش هفتگی کارورزی
          </KvDialogDescription>
        </KvDialogHeader>

        <KvScrollArea className="max-h-[min(70vh,560px)] overflow-y-auto pe-kv-micro [direction:ltr]">
          <div className="flex flex-col gap-kv-group [direction:rtl]">
          {modal.locked && modal.lockNotice ? (
            <KvAlert
              variant={modal.lockNotice.variant}
              title={modal.lockNotice.title}
              description={modal.lockNotice.description}
            />
          ) : null}

          {modal.feedback?.advisor ? (
            <FeedbackBlock
              title="بازخورد استاد راهنما:"
              icon={faIcons.userTie}
              body={modal.feedback.advisor}
              at={modal.feedback.advisorAt}
            />
          ) : null}
          {modal.feedback?.mentor ? (
            <FeedbackBlock
              title="بازخورد معلم راهنما:"
              icon={faIcons.chalkboardUser}
              body={modal.feedback.mentor}
              rating={modal.feedback.mentorRating}
              at={modal.feedback.mentorAt}
            />
          ) : null}
          {modal.feedback?.principal ? (
            <FeedbackBlock
              title="بازخورد مدیر مدرسه:"
              icon={faIcons.school}
              body={modal.feedback.principal}
              rating={modal.feedback.principalRating}
              at={modal.feedback.principalAt}
            />
          ) : null}

          {modal.reportSubmittedAt ? (
            <KvTypography variant="caption" tone="muted" as="p">
              تاریخ ارسال گزارش: {formatJalaliDateTimeDisplay(modal.reportSubmittedAt)}
            </KvTypography>
          ) : null}

          <div className={modal.locked ? 'opacity-60' : undefined}>
            <KvTextArea
              label={false}
              size="lg"
              rows={7}
              locked={modal.locked}
              value={modal.text}
              placeholder="گزارش دقیق خود را طبق سرفصل‌ها و آیین‌نگارش آموزشی در این بخش بنویسید..."
              onChange={(event) => modal.setText(event.target.value)}
            />
          </div>

          <KvMultiFileDropzone
            files={modal.files}
            disabled={modal.locked || modal.busy}
            maxFileSizeMb={WEEKLY_REPORT_MAX_FILE_SIZE_MB}
            maxTotalSizeMb={WEEKLY_REPORT_MAX_TOTAL_SIZE_MB}
            accept={WEEKLY_REPORT_ACCEPT}
            acceptLabel={WEEKLY_REPORT_ACCEPT_LABEL}
            invalidTypeMessage={WEEKLY_REPORT_INVALID_TYPE_MESSAGE}
            onAdd={modal.addFiles}
            onRemove={modal.removeFile}
          />
          </div>
        </KvScrollArea>

        <KvDialogFooter>
          {modal.locked ? (
            <KvButton
              type="button"
              color="neutral"
              appearance="secondary"
              size="md"
              onClick={onClose}
            >
              بستن و بازگشت
            </KvButton>
          ) : (
            <>
              <KvButton
                type="button"
                color="neutral"
                appearance="secondary"
                size="md"
                disabled={modal.busy}
                onClick={onClose}
              >
                انصراف
              </KvButton>
              <KvButton
                type="button"
                color="cta"
                appearance="ghost"
                size="md"
                loading={modal.isSavingDraft}
                disabled={modal.busy}
                onClick={() => void modal.saveDraft()}
              >
                ذخیره پیش‌نویس
              </KvButton>
              <KvButton
                type="button"
                color="success"
                appearance="solid"
                size="md"
                loading={modal.isSubmitting}
                disabled={modal.busy}
                icon={<FaIcon icon={faIcons.cloudArrowUp} size="xs" />}
                onClick={() => void modal.submitForFeedback()}
              >
                ارسال برای بازخورد
              </KvButton>
            </>
          )}
        </KvDialogFooter>
      </KvDialogContent>
    </KvDialog>
  );
}

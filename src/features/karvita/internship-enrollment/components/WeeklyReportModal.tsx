'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
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
import {
  WEEKLY_REPORT_ACCEPT,
  WEEKLY_REPORT_ACCEPT_LABEL,
  WEEKLY_REPORT_INVALID_TYPE_MESSAGE,
  WEEKLY_REPORT_MAX_FILE_SIZE_MB,
  WEEKLY_REPORT_MAX_TOTAL_SIZE_MB,
} from '@/services/internship-enrollment/weekly-report-attachment-limits';
import type {
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
  InternshipWeeklySession,
} from '@/types/internship-enrollment';
import { faIcons } from '@/utils/iconMap';

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
}: {
  title: string;
  icon: (typeof faIcons)[keyof typeof faIcons];
  body: string;
}) {
  return (
    <KvAlert
      variant="warning"
      title={title}
      icon={<FaIcon icon={icon} size="sm" />}
      description={
        <KvTypography variant="body" as="p">
          {body}
        </KvTypography>
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

        <div className="max-h-[min(70vh,560px)] overflow-y-auto pe-kv-micro [direction:ltr]">
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
            />
          ) : null}
          {modal.feedback?.mentor ? (
            <FeedbackBlock
              title="بازخورد معلم راهنما:"
              icon={faIcons.chalkboardUser}
              body={modal.feedback.mentor}
            />
          ) : null}
          {modal.feedback?.principal ? (
            <FeedbackBlock
              title="بازخورد مدیر مدرسه:"
              icon={faIcons.school}
              body={modal.feedback.principal}
            />
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
        </div>

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

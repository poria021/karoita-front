'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvScrollArea } from '@/components/shared/KvScrollArea';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import {
  KvDialog,
  KvDialogContent,
  KvDialogDescription,
  KvDialogFooter,
  KvDialogHeader,
  KvDialogTitle,
} from '@/components/shared/KvDialog';
import type {
  DailyApprovalCompetencyRating,
  DailyApprovalTrainee,
  DailyApprovalWeek,
} from '@/types/daily-approvals';
import type { InternshipCompetencyRating } from '@/types/internship-enrollment';
import type { UserRole } from '@/types/auth';
import { faIcons } from '@/utils/iconMap';
import { formatJalaliDateTimeDisplay } from '@/utils/formatJalaliDate';

import { competencyRatingLabel } from '../constants';
import { useDailyApprovalWeekGradingModal } from '../hooks/useDailyApprovalWeekGradingModal';
import { DailyApprovalMentorGradingFields } from './DailyApprovalMentorGradingFields';
import { DailyApprovalPrincipalGradingFields } from './DailyApprovalPrincipalGradingFields';
import { DailyApprovalSupervisorGradingFields } from './DailyApprovalSupervisorGradingFields';
import { DailyApprovalWeekReportReadonly } from './DailyApprovalWeekReportReadonly';

function FeedbackHistoryBlock({
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
      variant="info"
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

type DailyApprovalWeekGradingModalProps = {
  open: boolean;
  role: UserRole | null | undefined;
  trainee: DailyApprovalTrainee | null;
  week: DailyApprovalWeek | null;
  actionBusy: boolean;
  /** حد نصاب قبولی سیستم (۰–۱۰۰) از تنظیمات عمومی ترم‌ها. */
  passingScoreThreshold?: number;
  onClose: () => void;
  onSaveSupervisor: (input: {
    score: number | null;
    advisorFeedback: string;
  }) => Promise<void>;
  onSaveMentor: (input: {
    mentorFeedback: string;
    mentorRating: DailyApprovalCompetencyRating;
  }) => Promise<void>;
  onSavePrincipal: (input: {
    principalFeedback: string;
    principalRating: DailyApprovalCompetencyRating | null;
  }) => Promise<void>;
};

export function DailyApprovalWeekGradingModal({
  open,
  role,
  trainee,
  week,
  actionBusy,
  passingScoreThreshold,
  onClose,
  onSaveSupervisor,
  onSaveMentor,
  onSavePrincipal,
}: DailyApprovalWeekGradingModalProps) {
  const modal = useDailyApprovalWeekGradingModal({
    role,
    trainee,
    week,
    actionBusy,
    onClose,
    onSaveSupervisor,
    onSaveMentor,
    onSavePrincipal,
  });

  if (!trainee || !week) return null;

  const saveLabel =
    role === 'supervisor_professor'
      ? modal.scoreInput.trim() === ''
        ? 'ثبت بازخورد اصلاحی'
        : 'ثبت و تایید نهایی نمره'
      : role === 'mentor_teacher'
        ? 'ثبت نهایی ارزیابی مربی'
        : 'ثبت نهایی ارزیابی مدیر';

  // هر سه مسیر به بک‌اند واقعی وصل‌اند: نمرهٔ استاد → `PATCH student-weeks/{id}/score`؛
  // رد بدون نمره (استاد) و بازخورد+امتیاز معلم/مدیر → `POST conversations/{id}/messages`
  // (ببین `scoreRealDailyApprovalWeek`/`submitMentorFeedbackReal`/`submitPrincipalFeedbackReal`).
  // معلم راهنما امتیاز الزامی دارد (بازخورد اختیاری)؛ مدیر مدرسه هردو اختیاری‌اند
  // (اعتبارسنجی «حداقل یکی» در خودِ `save()` با toast انجام می‌شود).
  const alreadySubmitted =
    (role === 'supervisor_professor' && modal.supervisorLocked) ||
    (role === 'mentor_teacher' && modal.mentorAlreadySubmitted) ||
    (role === 'school_principal' && modal.principalAlreadySubmitted);

  const saveDisabled =
    modal.disabled || (role === 'mentor_teacher' && modal.mentorRatingMissing);

  const saveButton = alreadySubmitted ? null : (
    <KvButton
      type="button"
      color={
        role === 'supervisor_professor' && modal.scoreInput.trim() === ''
          ? 'warning'
          : 'success'
      }
      appearance="solid"
      size="md"
      disabled={saveDisabled}
      loading={actionBusy}
      onClick={() => void modal.save()}
    >
      {saveLabel}
    </KvButton>
  );

  return (
    <KvDialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          modal.resetForm();
        }
        if (!next && !actionBusy) onClose();
      }}
    >
      <KvDialogContent
        size="lg"
        className="max-w-[640px]"
        showCloseButton
        onPointerDownOutside={(event) => {
          if (actionBusy) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (actionBusy) event.preventDefault();
        }}
      >
        <KvDialogHeader>
          <KvDialogTitle>{modal.title}</KvDialogTitle>
          <KvDialogDescription>{modal.subtitle}</KvDialogDescription>
        </KvDialogHeader>

        <KvScrollArea className="-mx-kv-stack max-h-[min(70vh,560px)] overflow-y-auto px-kv-stack [direction:ltr] sm:-mx-kv-section sm:px-kv-section">
          <div className="flex flex-col gap-kv-group [direction:rtl]">
            {modal.dropped ? (
              <KvAlert
                variant="error"
                title="این کارورز از کلاس آموزشی اخراج شده است!"
                description="به علت اخراج تحصیلی توسط استاد راهنما، فرآیند ارزیابی این کارورز متوقف و پنل ارزیابی فریز گردیده است."
              />
            ) : null}

            <fieldset
              disabled={modal.disabled}
              className="min-w-0 space-y-kv-group border-0 p-0"
            >
              <DailyApprovalWeekReportReadonly week={week} />

              {/* بازخورد استاد همیشه اینجا نمایش داده می‌شود — DailyApprovalSupervisorGradingFields
                  آن را (چون فیلد قابل‌ویرایش خودِ استاد است) دوباره نشان نمی‌دهد.
                  بازخورد معلم/مدیر فقط برای بازبین‌های غیرِ استاد اینجا می‌آید — برای استاد
                  همین دو مورد با امتیاز و تاریخ در DailyApprovalSupervisorGradingFields هست. */}
              {week.feedback.advisor ? (
                <FeedbackHistoryBlock
                  title="بازخورد استاد راهنما:"
                  icon={faIcons.userTie}
                  body={week.feedback.advisor}
                  at={week.feedback.advisorAt}
                />
              ) : null}
              {role !== 'supervisor_professor' && week.feedback.mentor ? (
                <FeedbackHistoryBlock
                  title="بازخورد معلم راهنما:"
                  icon={faIcons.chalkboardUser}
                  body={week.feedback.mentor}
                  rating={week.feedback.mentorRating}
                  at={week.feedback.mentorAt}
                />
              ) : null}
              {role !== 'supervisor_professor' && week.feedback.principal ? (
                <FeedbackHistoryBlock
                  title="بازخورد مدیر مدرسه:"
                  icon={faIcons.school}
                  body={week.feedback.principal}
                  rating={week.feedback.principalRating}
                  at={week.feedback.principalAt}
                />
              ) : null}

              {role === 'supervisor_professor' && !modal.supervisorLocked ? (
                <DailyApprovalSupervisorGradingFields
                  week={week}
                  schoolName={trainee.schoolName}
                  advisorFeedback={modal.advisorFeedback}
                  scoreInput={modal.scoreInput}
                  passingScoreThreshold={passingScoreThreshold}
                  onAdvisorFeedbackChange={modal.setAdvisorFeedback}
                  onScoreInputChange={modal.handleScoreInputChange}
                />
              ) : null}

              {role === 'mentor_teacher' && !modal.mentorAlreadySubmitted ? (
                <DailyApprovalMentorGradingFields
                  mentorRating={modal.mentorRating}
                  mentorFeedback={modal.mentorFeedback}
                  onMentorRatingChange={modal.setMentorRating}
                  onMentorFeedbackChange={modal.setMentorFeedback}
                />
              ) : null}

              {role === 'school_principal' && !modal.principalAlreadySubmitted ? (
                <DailyApprovalPrincipalGradingFields
                  principalRating={modal.principalRating}
                  principalFeedback={modal.principalFeedback}
                  onPrincipalRatingChange={modal.setPrincipalRating}
                  onPrincipalFeedbackChange={modal.setPrincipalFeedback}
                />
              ) : null}
            </fieldset>
          </div>
        </KvScrollArea>

        <KvDialogFooter>
          <KvButton
            type="button"
            color="neutral"
            appearance="secondary"
            size="md"
            disabled={actionBusy}
            onClick={onClose}
          >
            لغو
          </KvButton>

          {saveButton}
        </KvDialogFooter>
      </KvDialogContent>
    </KvDialog>
  );
}

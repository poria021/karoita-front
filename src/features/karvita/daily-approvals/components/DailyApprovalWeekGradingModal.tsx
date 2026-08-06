'use client';

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
import type {
  DailyApprovalCompetencyRating,
  DailyApprovalTrainee,
  DailyApprovalWeek,
} from '@/types/daily-approvals';
import type { UserRole } from '@/types/auth';

import { useDailyApprovalWeekGradingModal } from '../hooks/useDailyApprovalWeekGradingModal';
import { DailyApprovalMentorGradingFields } from './DailyApprovalMentorGradingFields';
import { DailyApprovalPrincipalGradingFields } from './DailyApprovalPrincipalGradingFields';
import { DailyApprovalSupervisorGradingFields } from './DailyApprovalSupervisorGradingFields';
import { DailyApprovalWeekReportReadonly } from './DailyApprovalWeekReportReadonly';

type DailyApprovalWeekGradingModalProps = {
  open: boolean;
  role: UserRole | null | undefined;
  trainee: DailyApprovalTrainee | null;
  week: DailyApprovalWeek | null;
  actionBusy: boolean;
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
    principalRating: DailyApprovalCompetencyRating;
  }) => Promise<void>;
};

export function DailyApprovalWeekGradingModal({
  open,
  role,
  trainee,
  week,
  actionBusy,
  onClose,
  onSaveSupervisor,
  onSaveMentor,
  onSavePrincipal,
}: DailyApprovalWeekGradingModalProps) {
  const modal = useDailyApprovalWeekGradingModal({
    open,
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

  const saveDisabled =
    modal.disabled ||
    (role === 'mentor_teacher' && modal.mentorFeedbackEmpty);

  return (
    <KvDialog
      open={open}
      onOpenChange={(next) => {
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

        <div className="-mx-kv-stack max-h-[min(70vh,560px)] overflow-y-auto px-kv-stack [direction:ltr] sm:-mx-kv-section sm:px-kv-section">
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

              {role === 'supervisor_professor' ? (
                <DailyApprovalSupervisorGradingFields
                  week={week}
                  schoolName={trainee.schoolName}
                  advisorFeedback={modal.advisorFeedback}
                  scoreInput={modal.scoreInput}
                  onAdvisorFeedbackChange={modal.setAdvisorFeedback}
                  onScoreInputChange={modal.handleScoreInputChange}
                />
              ) : null}

              {role === 'mentor_teacher' ? (
                <DailyApprovalMentorGradingFields
                  mentorRating={modal.mentorRating}
                  mentorFeedback={modal.mentorFeedback}
                  onMentorRatingChange={modal.setMentorRating}
                  onMentorFeedbackChange={modal.setMentorFeedback}
                />
              ) : null}

              {role === 'school_principal' ? (
                <DailyApprovalPrincipalGradingFields
                  principalRating={modal.principalRating}
                  principalFeedback={modal.principalFeedback}
                  onPrincipalRatingChange={modal.setPrincipalRating}
                  onPrincipalFeedbackChange={modal.setPrincipalFeedback}
                />
              ) : null}
            </fieldset>
          </div>
        </div>

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

          <KvButton
            type="button"
            color={
              role === 'supervisor_professor' &&
              modal.scoreInput.trim() === ''
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
        </KvDialogFooter>
      </KvDialogContent>
    </KvDialog>
  );
}

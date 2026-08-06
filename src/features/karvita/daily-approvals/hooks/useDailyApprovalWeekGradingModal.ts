'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type {
  DailyApprovalCompetencyRating,
  DailyApprovalTrainee,
  DailyApprovalWeek,
} from '@/types/daily-approvals';
import type { UserRole } from '@/types/auth';
import { toPersianDigits } from '@/utils/persianDigits';

import { normalizeDailyApprovalScoreInput } from '../lib/dailyApprovalScore';

type UseDailyApprovalWeekGradingModalInput = {
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

function modalTitle(
  role: UserRole | null | undefined,
  traineeName: string
): string {
  if (role === 'supervisor_professor') {
    return `ثبت ارزشیابی کارورز - ${traineeName}`;
  }
  if (role === 'mentor_teacher') {
    return `ارزیابی کارورز - ${traineeName}`;
  }
  return `ارزیابی مدیر مدرسه - ${traineeName}`;
}

export function useDailyApprovalWeekGradingModal({
  open,
  role,
  trainee,
  week,
  actionBusy,
  onClose,
  onSaveSupervisor,
  onSaveMentor,
  onSavePrincipal,
}: UseDailyApprovalWeekGradingModalInput) {
  const [advisorFeedback, setAdvisorFeedback] = useState('');
  const [scoreInput, setScoreInput] = useState('');
  const [mentorRating, setMentorRating] =
    useState<DailyApprovalCompetencyRating>('5');
  const [mentorFeedback, setMentorFeedback] = useState('');
  const [principalRating, setPrincipalRating] =
    useState<DailyApprovalCompetencyRating>('5');
  const [principalFeedback, setPrincipalFeedback] = useState('');

  useEffect(() => {
    if (!open || !week) return;
    setAdvisorFeedback(week.feedback.advisor ?? '');
    setScoreInput(week.score === null ? '' : String(week.score));
    setMentorRating(week.feedback.mentorRating ?? '5');
    setMentorFeedback(week.feedback.mentor ?? '');
    setPrincipalRating(week.feedback.principalRating ?? '5');
    setPrincipalFeedback(week.feedback.principal ?? '');
  }, [open, week]);

  const dropped = trainee?.status === 'dropped';
  const disabled = dropped || actionBusy;
  const mentorFeedbackEmpty = mentorFeedback.trim() === '';
  const title = trainee ? modalTitle(role, trainee.traineeName) : '';
  const subtitle =
    trainee && week
      ? `ارزیابی هفته ${toPersianDigits(week.weekNumber)} - ${toPersianDigits(trainee.courseTitle)}`
      : '';

  const handleScoreInputChange = (raw: string) => {
    setScoreInput(normalizeDailyApprovalScoreInput(raw));
  };

  const save = async () => {
    if (!trainee || !week || dropped) return;

    if (role === 'supervisor_professor') {
      const trimmed = scoreInput.trim();
      const feedback = advisorFeedback.trim();
      if (!trimmed && !feedback) {
        toast.error('لطفاً نمره یا توضیحات بازخورد را ثبت نمایید.');
        return;
      }
      let score: number | null = null;
      if (trimmed) {
        const parsed = Number(trimmed);
        if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
          toast.error('لطفاً نمره معتبر بین ۰ تا ۱۰۰ وارد کنید.');
          return;
        }
        score = parsed;
      }
      await onSaveSupervisor({ score, advisorFeedback });
      return;
    }

    if (role === 'mentor_teacher') {
      if (mentorFeedbackEmpty) {
        toast.error('ثبت بازخورد متنی معلم راهنما الزامی است.');
        return;
      }
      await onSaveMentor({ mentorFeedback, mentorRating });
      return;
    }

    if (role === 'school_principal') {
      await onSavePrincipal({ principalFeedback, principalRating });
    }
  };

  return {
    title,
    subtitle,
    dropped,
    disabled,
    mentorFeedbackEmpty,
    advisorFeedback,
    setAdvisorFeedback,
    scoreInput,
    handleScoreInputChange,
    mentorRating,
    setMentorRating,
    mentorFeedback,
    setMentorFeedback,
    principalRating,
    setPrincipalRating,
    principalFeedback,
    setPrincipalFeedback,
    save,
    close: onClose,
  };
}

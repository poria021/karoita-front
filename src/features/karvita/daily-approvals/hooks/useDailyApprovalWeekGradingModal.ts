'use client';

import { useCallback, useState } from 'react';
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

// تابع کمکی برای آماده‌سازی مقادیر اولیه (بیرون از هوک برای جلوگیری از رندرهای بیهوده)
function getInitialGradingForm(week: DailyApprovalWeek | null) {
  return {
    advisorFeedback: week?.feedback.advisor ?? '',
    scoreInput: week?.score === null ? '' : String(week?.score ?? ''),
    mentorRating: (week?.feedback.mentorRating ?? '5') as DailyApprovalCompetencyRating,
    mentorFeedback: week?.feedback.mentor ?? '',
    principalRating: (week?.feedback.principalRating ?? '5') as DailyApprovalCompetencyRating,
    principalFeedback: week?.feedback.principal ?? '',
  };
}

export function useDailyApprovalWeekGradingModal({
  role,
  trainee,
  week,
  actionBusy,
  onClose,
  onSaveSupervisor,
  onSaveMentor,
  onSavePrincipal,
}: UseDailyApprovalWeekGradingModalInput) {
  // مقداردهی با Lazy Initializer برای بهینه‌سازی عملکرد در رندر اول
  const [advisorFeedback, setAdvisorFeedback] = useState(
    () => getInitialGradingForm(week).advisorFeedback
  );
  const [scoreInput, setScoreInput] = useState(
    () => getInitialGradingForm(week).scoreInput
  );
  const [mentorRating, setMentorRating] = useState<DailyApprovalCompetencyRating>(
    () => getInitialGradingForm(week).mentorRating
  );
  const [mentorFeedback, setMentorFeedback] = useState(
    () => getInitialGradingForm(week).mentorFeedback
  );
  const [principalRating, setPrincipalRating] =
    useState<DailyApprovalCompetencyRating>(
      () => getInitialGradingForm(week).principalRating
    );
  const [principalFeedback, setPrincipalFeedback] = useState(
    () => getInitialGradingForm(week).principalFeedback
  );

  const resetForm = useCallback(() => {
    const initial = getInitialGradingForm(week);
    setAdvisorFeedback(initial.advisorFeedback);
    setScoreInput(initial.scoreInput);
    setMentorRating(initial.mentorRating);
    setMentorFeedback(initial.mentorFeedback);
    setPrincipalRating(initial.principalRating);
    setPrincipalFeedback(initial.principalFeedback);
  }, [week]);

  // هر بار trainee/week عوض بشه (نه فقط موقع باز شدن مودال) فرم رو ریست کن —
  // طبق الگوی رسمی React این کار مستقیم حین رندر انجام می‌شه، نه با
  // useEffect (که یک رندر اضافه/cascading render ایجاد می‌کرد):
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const weekIdentity = trainee && week ? `${trainee.id}:${week.weekNumber}` : null;
  const [prevWeekIdentity, setPrevWeekIdentity] = useState(weekIdentity);
  if (weekIdentity !== prevWeekIdentity) {
    setPrevWeekIdentity(weekIdentity);
    resetForm();
  }

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
    resetForm,
    save,
    close: onClose,
  };
}
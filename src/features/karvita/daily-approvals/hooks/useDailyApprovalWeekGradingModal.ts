'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { useLocalFormDraft } from '@/hooks/useLocalFormDraft';
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
    principalRating: DailyApprovalCompetencyRating | null;
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
// امتیاز پیش‌فرض روی «انتخاب‌نشده» می‌ماند (نه ۵) — چون معلم باید واقعاً یک
// مقدار انتخاب کند، و مدیر مدرسه اصلاً مجبور نیست امتیاز بدهد.
function getInitialGradingForm(week: DailyApprovalWeek | null) {
  return {
    advisorFeedback: week?.feedback.advisor ?? '',
    scoreInput: week?.score === null ? '' : String(week?.score ?? ''),
    mentorRating: (week?.feedback.mentorRating ?? null) as DailyApprovalCompetencyRating | null,
    mentorFeedback: week?.feedback.mentor ?? '',
    principalRating: (week?.feedback.principalRating ?? null) as DailyApprovalCompetencyRating | null,
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
  const {
    value: draftValue,
    hasDraft: hasGradingDraft,
    setValue: setGradingDraft,
    clearDraft: clearGradingDraft,
  } = useLocalFormDraft<{
    advisorFeedback: string;
    scoreInput: string;
    mentorFeedback: string;
    principalFeedback: string;
  }>({
    key:
      trainee && week
        ? `daily-approval-grading:${trainee.id}:${week.weekNumber}`
        : 'daily-approval-grading:placeholder',
    initialValue: {
      advisorFeedback: '',
      scoreInput: '',
      mentorFeedback: '',
      principalFeedback: '',
    },
  });

  // مقداردهی با Lazy Initializer برای بهینه‌سازی عملکرد در رندر اول
  const [advisorFeedback, setAdvisorFeedback] = useState(
    () => getInitialGradingForm(week).advisorFeedback
  );
  const [scoreInput, setScoreInput] = useState(
    () => getInitialGradingForm(week).scoreInput
  );
  const [mentorRating, setMentorRating] = useState<DailyApprovalCompetencyRating | null>(
    () => getInitialGradingForm(week).mentorRating
  );
  const [mentorFeedback, setMentorFeedback] = useState(
    () => getInitialGradingForm(week).mentorFeedback
  );
  const [principalRating, setPrincipalRating] =
    useState<DailyApprovalCompetencyRating | null>(
      () => getInitialGradingForm(week).principalRating
    );
  const [principalFeedback, setPrincipalFeedback] = useState(
    () => getInitialGradingForm(week).principalFeedback
  );

  const resetForm = useCallback(() => {
    const initial = getInitialGradingForm(week);
    const restored = hasGradingDraft ? draftValue : null;
    setAdvisorFeedback(restored?.advisorFeedback ?? initial.advisorFeedback);
    setScoreInput(restored?.scoreInput ?? initial.scoreInput);
    setMentorRating(initial.mentorRating);
    setMentorFeedback(restored?.mentorFeedback ?? initial.mentorFeedback);
    setPrincipalRating(initial.principalRating);
    setPrincipalFeedback(restored?.principalFeedback ?? initial.principalFeedback);
  }, [draftValue, hasGradingDraft, week]);

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
  const mentorRatingMissing = mentorRating === null;
  const title = trainee ? modalTitle(role, trainee.traineeName) : '';
  const subtitle =
    trainee && week
      ? `ارزیابی هفته ${toPersianDigits(week.weekNumber)} - ${toPersianDigits(trainee.courseTitle)}`
      : '';

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
      clearGradingDraft();
      return;
    }

    if (role === 'mentor_teacher') {
      if (mentorRating === null) {
        toast.error('ثبت امتیاز شایستگی معلم راهنما الزامی است.');
        return;
      }
      await onSaveMentor({ mentorFeedback, mentorRating });
      clearGradingDraft();
      return;
    }

    if (role === 'school_principal') {
      if (!principalFeedback.trim() && principalRating === null) {
        toast.error('لطفاً امتیاز یا بازخورد توصیفی را ثبت نمایید.');
        return;
      }
      await onSavePrincipal({ principalFeedback, principalRating });
      clearGradingDraft();
    }
  };

  const persistGradingDraft = useCallback(
    (next: Partial<{
      advisorFeedback: string;
      scoreInput: string;
      mentorFeedback: string;
      principalFeedback: string;
    }>) => {
      setGradingDraft({
        advisorFeedback: next.advisorFeedback ?? advisorFeedback,
        scoreInput: next.scoreInput ?? scoreInput,
        mentorFeedback: next.mentorFeedback ?? mentorFeedback,
        principalFeedback: next.principalFeedback ?? principalFeedback,
      });
    },
    [advisorFeedback, mentorFeedback, principalFeedback, scoreInput, setGradingDraft]
  );

  return {
    title,
    subtitle,
    dropped,
    disabled,
    mentorRatingMissing,
    advisorFeedback,
    setAdvisorFeedback: (next: string) => {
      setAdvisorFeedback(next);
      persistGradingDraft({ advisorFeedback: next });
    },
    scoreInput,
    handleScoreInputChange: (raw: string) => {
      const next = normalizeDailyApprovalScoreInput(raw);
      setScoreInput(next);
      persistGradingDraft({ scoreInput: next });
    },
    mentorRating,
    setMentorRating,
    mentorFeedback,
    setMentorFeedback: (next: string) => {
      setMentorFeedback(next);
      persistGradingDraft({ mentorFeedback: next });
    },
    principalRating,
    setPrincipalRating,
    principalFeedback,
    setPrincipalFeedback: (next: string) => {
      setPrincipalFeedback(next);
      persistGradingDraft({ principalFeedback: next });
    },
    resetForm,
    save,
    close: onClose,
  };
}
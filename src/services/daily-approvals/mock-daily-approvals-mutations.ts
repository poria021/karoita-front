import {
  readTrainees,
  withDerived,
  writeTrainees,
} from '@/services/daily-approvals/mock-daily-approvals-persistence';
import { matchesCourse } from '@/services/daily-approvals/mock-daily-approvals-query';
import type {
  BulkExtendDailyApprovalWeeksInput,
  BulkExtendDailyApprovalWeeksResult,
  DailyApprovalTrainee,
  DailyApprovalWeek,
  UpdateDailyApprovalWeekInput,
  UpdateMentorDailyApprovalWeekInput,
  UpdatePrincipalDailyApprovalWeekInput,
} from '@/types/daily-approvals';

export function updateMockDailyApprovalWeek(
  input: UpdateDailyApprovalWeekInput
): DailyApprovalTrainee {
  const trainees = readTrainees();
  const traineeIndex = trainees.findIndex((row) => row.id === input.traineeId);
  if (traineeIndex < 0) throw new Error('کارورز موردنظر یافت نشد.');
  const trainee = trainees[traineeIndex]!;
  if (trainee.status === 'dropped') {
    throw new Error('این کارورز از کلاس آموزشی اخراج شده است.');
  }

  const weekIndex = trainee.weeks.findIndex((week) => week.id === input.weekId);
  if (weekIndex < 0) throw new Error('گزارش هفته یافت نشد.');

  const feedback = input.advisorFeedback.trim();
  const hasScore =
    input.score !== null && Number.isFinite(input.score) && input.score >= 0;
  if (!feedback && !hasScore) {
    throw new Error('ثبت نمره یا بازخورد اصلاحی الزامی است.');
  }
  if (hasScore && (input.score! < 0 || input.score! > 100)) {
    throw new Error('نمره علمی باید عددی بین 0 تا 100 باشد.');
  }

  const nextWeek: DailyApprovalWeek = {
    ...trainee.weeks[weekIndex]!,
    status: hasScore ? 'graded' : 'needs_edit',
    score: hasScore ? input.score : null,
    isExtended: false,
    feedback: {
      ...trainee.weeks[weekIndex]!.feedback,
      advisor: feedback,
    },
    readBySupervisor: true,
  };

  const nextWeeks = [...trainee.weeks];
  nextWeeks[weekIndex] = nextWeek;
  const nextTrainee = withDerived({ ...trainee, weeks: nextWeeks });
  const nextTrainees = [...trainees];
  nextTrainees[traineeIndex] = nextTrainee;
  writeTrainees(nextTrainees);
  return structuredClone(nextTrainee);
}

export function updateMockMentorDailyApprovalWeek(
  input: UpdateMentorDailyApprovalWeekInput
): DailyApprovalTrainee {
  const trainees = readTrainees();
  const traineeIndex = trainees.findIndex((row) => row.id === input.traineeId);
  if (traineeIndex < 0) throw new Error('کارورز موردنظر یافت نشد.');
  const trainee = trainees[traineeIndex]!;
  if (trainee.status === 'dropped') {
    throw new Error('این کارورز از کلاس آموزشی اخراج شده است.');
  }

  const weekIndex = trainee.weeks.findIndex((week) => week.id === input.weekId);
  if (weekIndex < 0) throw new Error('گزارش هفته یافت نشد.');

  const mentorFeedback = input.mentorFeedback.trim();
  if (!mentorFeedback) {
    throw new Error('ثبت بازخورد متنی معلم راهنما الزامی است.');
  }

  const nextWeeks = [...trainee.weeks];
  nextWeeks[weekIndex] = {
    ...trainee.weeks[weekIndex]!,
    status: 'approved',
    isExtended: false,
    feedback: {
      ...trainee.weeks[weekIndex]!.feedback,
      mentor: mentorFeedback,
      mentorRating: input.mentorRating,
    },
    readBySupervisor: true,
  };

  const nextTrainee = withDerived({ ...trainee, weeks: nextWeeks });
  const nextTrainees = [...trainees];
  nextTrainees[traineeIndex] = nextTrainee;
  writeTrainees(nextTrainees);
  return structuredClone(nextTrainee);
}

export function updateMockPrincipalDailyApprovalWeek(
  input: UpdatePrincipalDailyApprovalWeekInput
): DailyApprovalTrainee {
  const trainees = readTrainees();
  const traineeIndex = trainees.findIndex((row) => row.id === input.traineeId);
  if (traineeIndex < 0) throw new Error('کارورز موردنظر یافت نشد.');
  const trainee = trainees[traineeIndex]!;
  if (trainee.status === 'dropped') {
    throw new Error('این کارورز از کلاس آموزشی اخراج شده است.');
  }

  const weekIndex = trainee.weeks.findIndex((week) => week.id === input.weekId);
  if (weekIndex < 0) throw new Error('گزارش هفته یافت نشد.');

  const nextWeeks = [...trainee.weeks];
  nextWeeks[weekIndex] = {
    ...trainee.weeks[weekIndex]!,
    feedback: {
      ...trainee.weeks[weekIndex]!.feedback,
      principal: input.principalFeedback.trim(),
      principalRating: input.principalRating,
    },
    readBySupervisor: true,
  };

  const nextTrainee = withDerived({ ...trainee, weeks: nextWeeks });
  const nextTrainees = [...trainees];
  nextTrainees[traineeIndex] = nextTrainee;
  writeTrainees(nextTrainees);
  return structuredClone(nextTrainee);
}

function applyExtendToWeek(week: DailyApprovalWeek): DailyApprovalWeek {
  return {
    ...week,
    status: 'extended',
    isExtended: true,
    readBySupervisor: true,
  };
}

export function extendMockDailyApprovalWeek(input: {
  traineeId: string;
  weekId: string;
}): DailyApprovalTrainee {
  const trainees = readTrainees();
  const traineeIndex = trainees.findIndex((row) => row.id === input.traineeId);
  if (traineeIndex < 0) throw new Error('کارورز موردنظر یافت نشد.');
  const trainee = trainees[traineeIndex]!;
  if (trainee.status === 'dropped') {
    throw new Error('این کارورز از کلاس آموزشی اخراج شده است.');
  }
  const weekIndex = trainee.weeks.findIndex((week) => week.id === input.weekId);
  if (weekIndex < 0) throw new Error('گزارش هفته یافت نشد.');
  const week = trainee.weeks[weekIndex]!;
  if (week.status === 'graded') {
    throw new Error('هفته نمره‌گذاری‌شده قابل تمدید نیست.');
  }

  const nextWeeks = [...trainee.weeks];
  nextWeeks[weekIndex] = applyExtendToWeek(week);
  const nextTrainee = withDerived({ ...trainee, weeks: nextWeeks });
  const nextTrainees = [...trainees];
  nextTrainees[traineeIndex] = nextTrainee;
  writeTrainees(nextTrainees);
  return structuredClone(nextTrainee);
}

/**
 * تمدید گروهی: هفته‌های انتخاب‌شده برای همه کارورزان فعالِ فیلتر kind/term/course.
 * هفته‌های graded نادیده گرفته می‌شوند.
 */
export function bulkExtendMockDailyApprovalWeeks(
  input: BulkExtendDailyApprovalWeeksInput
): BulkExtendDailyApprovalWeeksResult {
  const weekNumbers = [
    ...new Set(
      input.weekNumbers.filter(
        (weekNumber) =>
          Number.isInteger(weekNumber) && weekNumber >= 1 && weekNumber <= 32
      )
    ),
  ];
  if (weekNumbers.length === 0) {
    throw new Error('حداقل یک هفته را برای تمدید انتخاب کنید.');
  }
  if (!input.termId) {
    throw new Error('نیم‌سال تحصیلی مشخص نشده است.');
  }

  const weekSet = new Set(weekNumbers);
  const trainees = readTrainees();
  let affectedTraineeCount = 0;
  let extendedPairCount = 0;

  const nextTrainees = trainees.map((trainee) => {
    if (trainee.kind !== input.kind) return trainee;
    if (trainee.termId !== input.termId) return trainee;
    if (!matchesCourse(trainee, input.course)) return trainee;
    if (trainee.status === 'dropped') return trainee;

    let touched = false;
    const nextWeeks = trainee.weeks.map((week) => {
      if (!weekSet.has(week.weekNumber)) return week;
      if (week.status === 'graded') return week;
      touched = true;
      extendedPairCount += 1;
      return applyExtendToWeek(week);
    });

    if (!touched) return trainee;
    affectedTraineeCount += 1;
    return withDerived({ ...trainee, weeks: nextWeeks });
  });

  if (extendedPairCount === 0) {
    throw new Error(
      'هیچ هفته‌ای برای تمدید یافت نشد (ممکن است همه نمره‌گذاری شده باشند).'
    );
  }

  writeTrainees(nextTrainees);
  return { affectedTraineeCount, extendedPairCount };
}

export function dropMockDailyApprovalTrainee(
  traineeId: string
): DailyApprovalTrainee {
  const trainees = readTrainees();
  const traineeIndex = trainees.findIndex((row) => row.id === traineeId);
  if (traineeIndex < 0) throw new Error('کارورز موردنظر یافت نشد.');
  const trainee = trainees[traineeIndex]!;
  const nextTrainee = withDerived({
    ...trainee,
    status: 'dropped',
    weeks: trainee.weeks.map((week) =>
      week.status === 'locked_future' || week.status === 'draft'
        ? { ...week, status: 'locked_dropped' as const }
        : week
    ),
  });
  const nextTrainees = [...trainees];
  nextTrainees[traineeIndex] = nextTrainee;
  writeTrainees(nextTrainees);
  return structuredClone(nextTrainee);
}

export function markMockWeekRead(input: {
  traineeId: string;
  weekId: string;
}): DailyApprovalTrainee {
  const trainees = readTrainees();
  const traineeIndex = trainees.findIndex((row) => row.id === input.traineeId);
  if (traineeIndex < 0) throw new Error('کارورز موردنظر یافت نشد.');
  const trainee = trainees[traineeIndex]!;
  const weekIndex = trainee.weeks.findIndex((week) => week.id === input.weekId);
  if (weekIndex < 0) throw new Error('گزارش هفته یافت نشد.');
  const nextWeeks = [...trainee.weeks];
  nextWeeks[weekIndex] = {
    ...nextWeeks[weekIndex]!,
    readBySupervisor: true,
  };
  const nextTrainee = withDerived({ ...trainee, weeks: nextWeeks });
  const nextTrainees = [...trainees];
  nextTrainees[traineeIndex] = nextTrainee;
  writeTrainees(nextTrainees);
  return structuredClone(nextTrainee);
}

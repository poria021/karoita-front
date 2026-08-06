import { isMockApiMode } from '@/lib/api-mode';
import {
  TRAINEE_SEEDS,
  WEEK_STATE_CYCLE,
} from '@/services/daily-approvals/mock-daily-approvals-seeds';
import { readSyllabusSnapshot } from '@/services/syllabus-config/mock-syllabus-store';
import type {
  BulkExtendDailyApprovalWeeksInput,
  BulkExtendDailyApprovalWeeksResult,
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalProgressiveGrade,
  DailyApprovalReadFilter,
  DailyApprovalTrainee,
  DailyApprovalWeek,
  DailyApprovalWeekState,
  ListDailyApprovalsInput,
  ListDailyApprovalsPage,
  UpdateDailyApprovalWeekInput,
  UpdateMentorDailyApprovalWeekInput,
  UpdatePrincipalDailyApprovalWeekInput,
} from '@/types/daily-approvals';
import type { AcademicTermType } from '@/types/syllabus-config';
import { sliceOffsetLimitPage } from '@/utils/offset-limit-page';
import { persianToEnglishDigits } from '@/utils/persianDigits';

export {
  TRAINEE_SEEDS,
  WEEK_STATE_CYCLE,
} from '@/services/daily-approvals/mock-daily-approvals-seeds';

const STORAGE_KEY = 'karvita_mock_daily_approvals_v4';

function termTypeForKind(kind: DailyApprovalCourseKind): AcademicTermType {
  return kind === 'apprenticeship' ? 'modular' : 'semester';
}

export function listTermsForDailyApprovalKind(
  kind: DailyApprovalCourseKind
): Array<{ id: string; title: string }> {
  const preferredType = termTypeForKind(kind);
  return readSyllabusSnapshot()
    .terms.filter((term) => term.type === preferredType)
    .map((term) => ({ id: term.id, title: term.title }));
}

function defaultTermForKind(kind: DailyApprovalCourseKind): {
  id: string;
  title: string;
} {
  const terms = listTermsForDailyApprovalKind(kind);
  if (terms[0]) return terms[0];
  return kind === 'apprenticeship'
    ? { id: 'term_modular_1', title: 'دوره مهارتی' }
    : { id: 'term_2', title: 'نیم‌سال تحصیلی' };
}

function courseMeta(
  kind: DailyApprovalCourseKind,
  level: 1 | 2 | 3 | 4
): {
  courseKey: Exclude<DailyApprovalCourseFilter, 'all'>;
  courseTitle: string;
} {
  if (kind === 'internship') {
    return {
      courseKey: `intern${level}` as Exclude<DailyApprovalCourseFilter, 'all'>,
      courseTitle: `کارورزی ${level}`,
    };
  }
  const apprenticeshipLevel = level <= 2 ? level : 2;
  return {
    courseKey: `appr${apprenticeshipLevel}` as Exclude<
      DailyApprovalCourseFilter,
      'all'
    >,
    courseTitle: `کارآموزی ${apprenticeshipLevel}`,
  };
}

function buildWeek(
  traineeIndex: number,
  weekNumber: number,
  weekCount: number
): DailyApprovalWeek {
  const cycle = WEEK_STATE_CYCLE[(traineeIndex + weekNumber) % WEEK_STATE_CYCLE.length]!;
  let status: DailyApprovalWeekState = cycle;
  if (weekNumber > Math.min(weekCount, 6) + (traineeIndex % 2)) {
    status = 'locked_future';
  }
  if (weekNumber === 1 && traineeIndex % 5 === 0) status = 'graded';
  if (weekNumber === 2 && traineeIndex % 4 === 0) status = 'pending';
  if (weekNumber === 3 && traineeIndex % 3 === 0) status = 'needs_edit';

  const submitted =
    status !== 'draft' &&
    status !== 'locked_future' &&
    status !== 'overdue' &&
    status !== 'extended';

  return {
    id: `week-${weekNumber}`,
    weekNumber,
    status,
    score: status === 'graded' ? 70 + ((traineeIndex + weekNumber) % 25) : null,
    text: submitted
      ? 'در این هفته مشاهده تدریس، تهیه طرح درس و اجرای بخشی از کلاس با تمرکز بر مشارکت فراگیران انجام شد. بازخوردهای دریافت‌شده برای اصلاح زمان‌بندی فعالیت‌ها ثبت شده است.'
      : '',
    files:
      submitted && weekNumber % 2 === 1
        ? [
            {
              id: `file-${traineeIndex}-${weekNumber}`,
              name: `پیوست-هفته-${weekNumber}.pdf`,
              sizeMb: 1.1 + (weekNumber % 3) * 0.3,
              mimeType: 'application/pdf',
              url: 'data:application/pdf;base64,JVBERi0xLjQ=',
            },
          ]
        : [],
    feedback: {
      ...(status === 'needs_edit' || status === 'approved' || status === 'graded'
        ? {
            advisor:
              status === 'needs_edit'
                ? 'لطفاً ارتباط فعالیت‌ها با اهداف طرح درس را روشن‌تر توضیح دهید.'
                : 'گزارش از نظر علمی و ساختار ارائه تأیید می‌شود.',
          }
        : {}),
      ...(weekNumber % 3 === 0
        ? {
            mentor:
              'شرح فعالیت‌ها دقیق است. در گزارش بعدی شواهد بیشتری از مشارکت فراگیران اضافه شود.',
            mentorRating: (['3', '4', '5'] as const)[
              (traineeIndex + weekNumber) % 3
            ],
          }
        : {}),
      ...(weekNumber % 4 === 0
        ? {
            principal: 'حضور و اجرای برنامه هفتگی توسط مدرسه تأیید می‌شود.',
            principalRating: (['3', '4', '5'] as const)[
              (traineeIndex + weekNumber) % 3
            ],
          }
        : {}),
    },
    readBySupervisor:
      status === 'graded' || status === 'approved' || status === 'needs_edit',
    isExtended: status === 'extended',
  };
}

function passingScoreThreshold(): number {
  const value = readSyllabusSnapshot().passingScoreThreshold;
  return Number.isFinite(value) ? value : 70;
}

function computeProgressive(
  weeks: DailyApprovalWeek[],
  traineeStatus: DailyApprovalTrainee['status']
): DailyApprovalProgressiveGrade {
  if (traineeStatus === 'dropped') {
    return { gradedCount: 0, final20: null, statusLabel: 'حذف' };
  }
  const graded = weeks.filter((week) => week.status === 'graded' && week.score !== null);
  if (graded.length === 0) {
    return { gradedCount: 0, final20: null, statusLabel: 'فاقد نمره' };
  }
  const avg100 =
    graded.reduce((sum, week) => sum + (week.score ?? 0), 0) / graded.length;
  const final20 = Number(((avg100 / 100) * 20).toFixed(2));
  const threshold = passingScoreThreshold();
  return {
    gradedCount: graded.length,
    final20,
    statusLabel: avg100 >= threshold ? 'قبول' : 'مردود',
  };
}

function withDerived(trainee: DailyApprovalTrainee): DailyApprovalTrainee {
  const hasSubmitted = trainee.weeks.some(
    (week) =>
      week.status !== 'draft' &&
      week.status !== 'locked_future' &&
      week.status !== 'locked_dropped'
  );
  const unreadCount = trainee.weeks.filter(
    (week) =>
      week.status !== 'draft' &&
      week.status !== 'locked_future' &&
      week.status !== 'locked_dropped' &&
      week.status !== 'archived' &&
      !week.readBySupervisor
  ).length;
  const progressiveGrade = computeProgressive(trainee.weeks, trainee.status);
  return {
    ...trainee,
    hasSubmitted,
    unreadCount,
    progressiveGrade:
      trainee.status === 'dropped'
        ? { ...progressiveGrade, statusLabel: 'حذف' }
        : hasSubmitted && progressiveGrade.gradedCount === 0
          ? { ...progressiveGrade, statusLabel: 'در جریان' }
          : progressiveGrade,
  };
}

function buildSeedTrainee(index: number): DailyApprovalTrainee {
  const kind: DailyApprovalCourseKind =
    index % 3 === 0 ? 'apprenticeship' : 'internship';
  const level = ((index % (kind === 'internship' ? 4 : 2)) + 1) as 1 | 2 | 3 | 4;
  const weekCount = kind === 'internship' ? 16 : 8;
  const meta = courseMeta(kind, level);
  const seed = TRAINEE_SEEDS[index]!;
  const weeks = Array.from({ length: weekCount }, (_, weekIndex) =>
    buildWeek(index, weekIndex + 1, weekCount)
  );
  const status = index === 10 ? 'dropped' : 'active';
  const term = defaultTermForKind(kind);

  return withDerived({
    id: `trainee-course-${index + 1}`,
    traineeName: seed.name,
    identifier: `401${String(index + 1).padStart(6, '0')}`,
    major: seed.major,
    schoolName: seed.school,
    kind,
    level,
    courseKey: meta.courseKey,
    courseTitle: meta.courseTitle,
    termId: term.id,
    termTitle: term.title,
    status,
    unreadCount: 0,
    hasSubmitted: false,
    progressiveGrade: {
      gradedCount: 0,
      final20: null,
      statusLabel: 'در جریان',
    },
    weeks,
  });
}

const SEED_TRAINEES: DailyApprovalTrainee[] = TRAINEE_SEEDS.map((_, index) =>
  buildSeedTrainee(index)
);

let memoryTrainees: DailyApprovalTrainee[] | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function readTrainees(): DailyApprovalTrainee[] {
  if (memoryTrainees) return memoryTrainees.map(withDerived);

  if (isBrowser() && isMockApiMode()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        memoryTrainees = JSON.parse(raw) as DailyApprovalTrainee[];
        return memoryTrainees.map(withDerived);
      }
    } catch {
      // Damaged simulator data falls back to seed.
    }
  }

  memoryTrainees = structuredClone(SEED_TRAINEES);
  return memoryTrainees.map(withDerived);
}

function writeTrainees(trainees: DailyApprovalTrainee[]): void {
  memoryTrainees = structuredClone(trainees.map(withDerived));
  if (isBrowser() && isMockApiMode()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryTrainees));
  }
}

function matchesQuery(trainee: DailyApprovalTrainee, rawQuery: string): boolean {
  const query = persianToEnglishDigits(rawQuery).trim().toLocaleLowerCase('fa');
  if (!query) return true;
  const haystack = persianToEnglishDigits(
    [trainee.traineeName, trainee.identifier, trainee.courseTitle, trainee.major]
      .join(' ')
      .toLocaleLowerCase('fa')
  );
  return haystack.includes(query);
}

function matchesReadFilter(
  trainee: DailyApprovalTrainee,
  readFilter: DailyApprovalReadFilter
): boolean {
  if (readFilter === 'all') return true;
  if (readFilter === 'dropped') return trainee.status === 'dropped';
  if (trainee.status === 'dropped') return false;
  if (readFilter === 'unread') return trainee.unreadCount > 0;
  return trainee.hasSubmitted && trainee.unreadCount === 0;
}

function matchesCourse(
  trainee: DailyApprovalTrainee,
  course: DailyApprovalCourseFilter
): boolean {
  if (course === 'all') return true;
  return trainee.courseKey === course;
}

export function listMockDailyApprovals(
  input: ListDailyApprovalsInput
): ListDailyApprovalsPage {
  const filtered = readTrainees()
    .filter((trainee) => trainee.kind === input.kind)
    .filter((trainee) => trainee.termId === input.termId || !input.termId)
    .filter((trainee) => matchesQuery(trainee, input.query))
    .filter((trainee) => matchesReadFilter(trainee, input.readFilter))
    .filter((trainee) => matchesCourse(trainee, input.course))
    .sort((left, right) => {
      if (left.status === 'dropped' && right.status !== 'dropped') return 1;
      if (right.status === 'dropped' && left.status !== 'dropped') return -1;
      return right.unreadCount - left.unreadCount;
    });

  return {
    ...structuredClone(
      sliceOffsetLimitPage(filtered, input.offset, input.limit)
    ),
    terms: listTermsForDailyApprovalKind(input.kind),
  };
}

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

export function resetMockDailyApprovalsForTests(
  trainees?: DailyApprovalTrainee[] | null
): void {
  memoryTrainees = trainees ? structuredClone(trainees) : null;
}

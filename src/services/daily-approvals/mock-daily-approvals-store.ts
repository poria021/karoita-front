import { isMockApiMode } from '@/lib/api-mode';
import type {
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
} from '@/types/daily-approvals';
import { sliceOffsetLimitPage } from '@/utils/offset-limit-page';
import { persianToEnglishDigits } from '@/utils/persianDigits';

const STORAGE_KEY = 'karvita_mock_daily_approvals_v2';

const TERMS = [
  { id: 'term-1404-2', title: 'نیم‌سال دوم 1404-1405' },
  { id: 'term-1404-1', title: 'نیم‌سال اول 1404-1405' },
] as const;

const TRAINEE_SEEDS = [
  { name: 'مریم احمدی', major: 'آموزش ابتدایی', school: 'دبیرستان ماندگار البرز' },
  { name: 'علی رضایی', major: 'آموزش ابتدایی', school: 'مدرسه فرهنگ' },
  { name: 'زهرا کریمی', major: 'آموزش ریاضی', school: 'دبیرستان سعدی' },
  { name: 'محمد حسینی', major: 'آموزش ابتدایی', school: 'دبیرستان ماندگار البرز' },
  { name: 'نگار محمدی', major: 'آموزش علوم', school: 'مدرسه فرهنگ' },
  { name: 'امیرحسین موسوی', major: 'آموزش ابتدایی', school: 'دبیرستان ماندگار البرز' },
  { name: 'فاطمه اکبری', major: 'آموزش فارسی', school: 'دبیرستان سعدی' },
  { name: 'سینا رحمانی', major: 'آموزش ابتدایی', school: 'مدرسه فرهنگ' },
  { name: 'هانیه جعفری', major: 'آموزش ابتدایی', school: 'دبیرستان ماندگار البرز' },
  { name: 'رضا صادقی', major: 'آموزش علوم', school: 'دبیرستان سعدی' },
  { name: 'سمیه نادری', major: 'آموزش ابتدایی', school: 'مدرسه فرهنگ' },
  { name: 'پارسا توکلی', major: 'آموزش ریاضی', school: 'دبیرستان ماندگار البرز' },
] as const;

const WEEK_STATE_CYCLE: readonly DailyApprovalWeekState[] = [
  'graded',
  'approved',
  'pending',
  'needs_edit',
  'draft',
  'overdue',
  'locked_future',
  'extended',
];

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
          }
        : {}),
      ...(weekNumber % 4 === 0
        ? { principal: 'حضور و اجرای برنامه هفتگی توسط مدرسه تأیید می‌شود.' }
        : {}),
    },
    readBySupervisor:
      status === 'graded' || status === 'approved' || status === 'needs_edit',
    isExtended: status === 'extended',
  };
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
  return {
    gradedCount: graded.length,
    final20,
    statusLabel: final20 >= 14 ? 'قبول' : 'مردود',
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
    termId: TERMS[0].id,
    termTitle: TERMS[0].title,
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
    terms: TERMS.map((term) => ({ ...term })),
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
    feedback: {
      ...trainee.weeks[weekIndex]!.feedback,
      advisor: feedback || trainee.weeks[weekIndex]!.feedback.advisor,
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
  nextWeeks[weekIndex] = {
    ...week,
    status: 'draft',
    isExtended: true,
    readBySupervisor: true,
  };
  const nextTrainee = withDerived({ ...trainee, weeks: nextWeeks });
  const nextTrainees = [...trainees];
  nextTrainees[traineeIndex] = nextTrainee;
  writeTrainees(nextTrainees);
  return structuredClone(nextTrainee);
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

import { isMockApiMode } from '@/lib/api-mode';
import { withDerivedDailyApprovalTrainee } from '@/services/daily-approvals/daily-approval-derived';
import {
  TRAINEE_SEEDS,
  WEEK_STATE_CYCLE,
} from '@/services/daily-approvals/mock-daily-approvals-seeds';
import {
  listTermsForDailyApprovalKind,
  readDailyApprovalPassingScoreThreshold,
} from '@/services/syllabus-config/syllabus-daily-approvals-reads';
import type {
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalTrainee,
  DailyApprovalWeek,
  DailyApprovalWeekState,
} from '@/types/daily-approvals';

const STORAGE_KEY = 'karvita_mock_daily_approvals_v4';

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
  const cycle =
    WEEK_STATE_CYCLE[(traineeIndex + weekNumber) % WEEK_STATE_CYCLE.length]!;
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

export function withDerived(trainee: DailyApprovalTrainee): DailyApprovalTrainee {
  return withDerivedDailyApprovalTrainee(
    trainee,
    readDailyApprovalPassingScoreThreshold()
  );
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

export function readTrainees(): DailyApprovalTrainee[] {
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

export function writeTrainees(trainees: DailyApprovalTrainee[]): void {
  memoryTrainees = structuredClone(trainees.map(withDerived));
  if (isBrowser() && isMockApiMode()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryTrainees));
  }
}

export function resetMockDailyApprovalsForTests(
  trainees?: DailyApprovalTrainee[] | null
): void {
  memoryTrainees = trainees ? structuredClone(trainees) : null;
}

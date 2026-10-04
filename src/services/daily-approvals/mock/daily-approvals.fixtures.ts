import { withDerivedDailyApprovalTrainee } from '@/services/daily-approvals/daily-approval-derived';
import {
  toDailyApprovalCatalogCourses,
  toDailyApprovalWeekOptions,
} from '@/services/daily-approvals/daily-approval-catalog-mappers';
import {
  TRAINEE_SEEDS,
  WEEK_STATE_CYCLE,
} from '@/services/daily-approvals/mock/daily-approvals.seeds';
import { mockSyllabusSnapshot } from '@/services/syllabus-config/mock/syllabus.fixtures';
import type {
  BulkExtendDailyApprovalWeeksResult,
  DailyApprovalCatalogCourse,
  DailyApprovalReadFilter,
  DailyApprovalWeekOption,
  ListDailyApprovalsInput,
  ListDailyApprovalsPage,
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalTrainee,
  DailyApprovalWeek,
  DailyApprovalWeekState,
} from '@/types/daily-approvals';
import { sliceOffsetLimitPage } from '@/utils/offset-limit-page';
import { persianToEnglishDigits } from '@/utils/persianDigits';

/** داده‌ی ثابت حالت mock — هیچ state یا ذخیره‌سازی‌ای ندارد. */

const PASSING_SCORE_THRESHOLD = 70;

/** کارورزی → ترم نیم‌سال؛ مهارت‌آموزی → پودمانی. */
export function mockDailyApprovalTerms(
  kind: DailyApprovalCourseKind
): Array<{ id: string; title: string }> {
  const type = kind === 'apprenticeship' ? 'modular' : 'semester';
  return mockSyllabusSnapshot()
    .terms.filter((term) => term.type === type)
    .map((term) => ({ id: term.id, title: term.title }));
}

export function mockDailyApprovalPassingScore(): number {
  return PASSING_SCORE_THRESHOLD;
}

function defaultTermForKind(kind: DailyApprovalCourseKind): {
  id: string;
  title: string;
} {
  const terms = mockDailyApprovalTerms(kind);
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
    weightedScore:
      status === 'graded' ? 70 + ((traineeIndex + weekNumber) % 25) : null,
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

function withDerived(trainee: DailyApprovalTrainee): DailyApprovalTrainee {
  return withDerivedDailyApprovalTrainee(trainee, PASSING_SCORE_THRESHOLD);
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

let trainees: DailyApprovalTrainee[] | null = null;

export function mockDailyApprovalTrainees(): DailyApprovalTrainee[] {
  trainees ??= TRAINEE_SEEDS.map((_, index) => buildSeedTrainee(index));
  return structuredClone(trainees);
}

/** فراگیر ثابت با شناسهٔ داده‌شده (یا اولین فراگیر) — برای پاسخ عملیات نوشتن در mock. */
export function mockDailyApprovalTrainee(traineeId: string): DailyApprovalTrainee {
  const all = mockDailyApprovalTrainees();
  return all.find((row) => row.id === traineeId) ?? all[0]!;
}

const MOCK_INTERNSHIP_COURSES = [
  { id: 'intern1', title: 'کارورزی ۱' },
  { id: 'intern2', title: 'کارورزی ۲' },
  { id: 'intern3', title: 'کارورزی ۳' },
  { id: 'intern4', title: 'کارورزی ۴' },
];

const MOCK_APPRENTICESHIP_COURSES = [
  { id: 'appr1', title: 'کارآموزی ۱' },
  { id: 'appr2', title: 'کارآموزی ۲' },
];

export function mockDailyApprovalCourses(
  kind: DailyApprovalCourseKind
): DailyApprovalCatalogCourse[] {
  return toDailyApprovalCatalogCourses(
    kind,
    kind === 'internship' ? MOCK_INTERNSHIP_COURSES : MOCK_APPRENTICESHIP_COURSES
  );
}

export function mockDailyApprovalWeeks(
  kind: DailyApprovalCourseKind
): DailyApprovalWeekOption[] {
  const count = kind === 'internship' ? 16 : 8;
  return toDailyApprovalWeekOptions(
    Array.from({ length: count }, (_, index) => ({ title: `هفته ${index + 1}` }))
  );
}

function matchesQuery(trainee: DailyApprovalTrainee, rawQuery: string): boolean {
  const query = persianToEnglishDigits(rawQuery).trim().toLocaleLowerCase('fa');
  if (!query) return true;
  return persianToEnglishDigits(
    [trainee.traineeName, trainee.identifier, trainee.courseTitle, trainee.major]
      .join(' ')
      .toLocaleLowerCase('fa')
  ).includes(query);
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

export function mockDailyApprovalsPage(
  input: ListDailyApprovalsInput
): ListDailyApprovalsPage {
  const filtered = mockDailyApprovalTrainees()
    .filter((row) => row.kind === input.kind)
    .filter((row) => !input.termId || row.termId === input.termId)
    .filter((row) => matchesQuery(row, input.query))
    .filter((row) => matchesReadFilter(row, input.readFilter))
    .filter((row) => input.course === 'all' || row.courseKey === input.course)
    .filter(
      (row) => !input.scopeKeys || input.scopeKeys.includes(row.courseKey)
    );
  return {
    ...sliceOffsetLimitPage(filtered, input.offset, input.limit),
    terms: mockDailyApprovalTerms(input.kind),
  };
}

export const MOCK_BULK_EXTEND_RESULT: BulkExtendDailyApprovalWeeksResult = {
  affectedTraineeCount: 0,
  extendedPairCount: 0,
  revokedPairCount: 0,
};

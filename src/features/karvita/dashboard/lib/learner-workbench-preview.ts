import type {
  InternshipCourseKind,
  InternshipEnrollmentPageState,
  InternshipWeeklySession,
  InternshipWeeklySessionState,
} from '@/types/internship-enrollment';
import type { CourseMaterial } from '@/types/course-materials';
import { toPersianDigits } from '@/utils/persianDigits';

import type {
  LearnerActiveCourse,
  LearnerLevelSnapshot,
} from './learner-workbench';

/**
 * پیش‌نمایش با داده‌ی فیک برای باکس‌های میز کار فراگیر.
 *
 * - `true` (و فقط در development): `DashboardLearnerGradesChart` به‌جای داده‌ی واقعی
 *   از `FAKE_LEARNER_SNAPSHOTS` می‌خواند.
 * - برای برگشت به داده‌ی واقعی این را `false` کنید (یا فایل را پاک کنید).
 * در build تولید (`NODE_ENV === 'production'`) هرگز فعال نمی‌شود.
 */
const FAKE_PREVIEW_SWITCH = true;

export const LEARNER_WORKBENCH_FAKE_PREVIEW =
  FAKE_PREVIEW_SWITCH && process.env.NODE_ENV !== 'production';

type WeekSpec = InternshipWeeklySessionState | readonly [
  InternshipWeeklySessionState,
  number,
];

function makeWeeks(specs: readonly WeekSpec[]): InternshipWeeklySession[] {
  return specs.map((spec, index) => {
    const [status, score] = typeof spec === 'string' ? [spec, null] : spec;
    return {
      id: `w${index + 1}`,
      title: `هفته ${toPersianDigits(index + 1)}`,
      status,
      score: status === 'graded' ? score : null,
    };
  });
}

const OPEN_TERM_ID = 'term-1403-2';

function snapshot(input: {
  level: number;
  kind: InternshipCourseKind;
  courseTitle: string;
  termId?: string;
  enrollmentStatus?: 'active' | 'completed';
  weeks: InternshipWeeklySession[];
  final20: number | null;
}): LearnerLevelSnapshot {
  const termId = input.termId ?? OPEN_TERM_ID;
  const termTitle =
    termId === OPEN_TERM_ID ? 'نیم‌سال دوم ۱۴۰۳' : 'نیم‌سال اول ۱۴۰۳';
  const state: InternshipEnrollmentPageState = {
    scenario: 'S5_term_active',
    kind: input.kind,
    level: input.level,
    courseName: input.kind === 'internship' ? 'کارورزی' : 'کارآموزی',
    courseTitle: input.courseTitle,
    termTitle,
    termId,
    openTermId: OPEN_TERM_ID,
    lessonId: `fake_${input.kind}_${input.level}`,
    enrollment: {
      enrollmentId: `fake-e-${input.kind}-${input.level}`,
      supervisorName: 'دکتر احمدی',
      attendanceDaysLabel: '',
      schoolId: null,
      schoolName: null,
      mentorId: null,
      mentorName: null,
      courseTitle: input.courseTitle,
      termTitle,
      status: input.enrollmentStatus ?? 'active',
      removalPending: false,
      isTermArchived: false,
      weeks: input.weeks,
      progressiveGrade: {
        gradedCount: input.weeks.filter((week) => week.status === 'graded')
          .length,
        final20: input.final20,
      },
      weeksAreReal: true,
    },
    termHistory: [],
    selection: null,
    conflictEnrollment: null,
  };
  return { level: input.level, state };
}

/**
 * ۵ درس با ترکیب وضعیت‌ها:
 * ۱) کارورزی ۱ — ترم قبل، کاملاً تمام‌شده (۱۶ هفته نمره‌دار)
 * ۲) کارورزی ۲ — ترم جاری، نمره‌دار + نیازمند ویرایش + تأیید + ارسال‌شده + قفل
 * ۳) کارورزی ۳ — ترم جاری، پیش‌نویس / معوق / تمدید شده
 * ۴) کارورزی ۴ — ترم جاری، هنوز هیچ هفته‌ای باز نشده (نمره‌ی نهایی «—»)
 * ۵) کارآموزی ۱ — ۸ هفته (ردیف کوتاه‌تر از بقیه)
 */
export const FAKE_LEARNER_SNAPSHOTS: LearnerLevelSnapshot[] = [
  snapshot({
    level: 1,
    kind: 'internship',
    courseTitle: 'کارورزی ۱',
    termId: 'term-1403-1',
    enrollmentStatus: 'completed',
    final20: 17.5,
    weeks: makeWeeks([
      ['graded', 92],
      ['graded', 88],
      ['graded', 90],
      ['graded', 85],
      ['graded', 94],
      ['graded', 87],
      ['graded', 91],
      ['graded', 89],
      ['graded', 86],
      ['graded', 93],
      ['graded', 90],
      ['graded', 88],
      ['graded', 95],
      ['graded', 84],
      ['graded', 92],
      ['graded', 90],
    ]),
  }),
  snapshot({
    level: 2,
    kind: 'internship',
    courseTitle: 'کارورزی ۲',
    final20: 15.25,
    weeks: makeWeeks([
      ['graded', 82],
      ['graded', 78],
      ['graded', 85],
      ['graded', 74],
      ['graded', 80],
      ['graded', 69],
      ['graded', 77],
      ['graded', 83],
      'needs_edit',
      'approved',
      'pending',
      'pending',
      'draft',
      'locked_future',
      'locked_future',
      'locked_future',
    ]),
  }),
  snapshot({
    level: 3,
    kind: 'internship',
    courseTitle: 'کارورزی ۳',
    final20: 12.5,
    weeks: makeWeeks([
      ['graded', 70],
      ['graded', 64],
      'overdue',
      'extended',
      'pending',
      'draft',
      'draft',
      'locked_future',
      'locked_future',
      'locked_future',
      'locked_future',
      'locked_future',
      'locked_future',
      'locked_future',
      'locked_future',
      'locked_future',
    ]),
  }),
  snapshot({
    level: 4,
    kind: 'internship',
    courseTitle: 'کارورزی ۴',
    final20: null,
    weeks: makeWeeks(Array.from({ length: 16 }, () => 'locked_future' as const)),
  }),
  snapshot({
    level: 1,
    kind: 'apprenticeship',
    courseTitle: 'کارآموزی ۱',
    final20: 18,
    weeks: makeWeeks([
      ['graded', 96],
      ['graded', 90],
      ['graded', 92],
      'approved',
      'pending',
      'draft',
      'locked_future',
      'locked_future',
    ]),
  }),
];

const FAKE_DATA_URL_PDF = 'data:application/pdf;base64,JVBERi0xLjQK';

type FakeMaterialSpec = {
  title: string;
  description: string;
  fileName: string;
  sizeBytes: number;
  createdAt: string;
  withFile: boolean;
};

/** ۳ نوع جزوه: کامل (توضیح+فایل)، فقط فایل بدون توضیح، و عنوان خیلی بلند. */
const FAKE_MATERIAL_SPECS: readonly FakeMaterialSpec[] = [
  {
    title: 'جزوه‌ی جلسه‌ی اول — آشنایی با محیط مدرسه',
    description:
      'در این جزوه با قوانین حضور در مدرسه، چیدمان کلاس و نحوه‌ی ثبت مشاهدات آشنا می‌شوید.\nقبل از هفته‌ی دوم حتماً مطالعه شود.',
    fileName: 'session-1.pdf',
    sizeBytes: 1_450_000,
    createdAt: '2026-11-16T09:30:00.000Z',
    withFile: true,
  },
  {
    title: 'الگوی نمونه‌ی گزارش هفتگی',
    description: '',
    fileName: 'weekly-report-template.docx',
    sizeBytes: 86_000,
    createdAt: '2026-11-10T14:05:00.000Z',
    withFile: true,
  },
  {
    title:
      'راهنمای کامل تحلیل مشاهدات کلاسی و نگارش بازخورد برای دانش‌آموزان در پایه‌های مختلف',
    description: 'مرجع تکمیلی برای هفته‌های پایانی ترم.',
    fileName: 'observation-guide.pdf',
    sizeBytes: 3_200_000,
    createdAt: '2026-11-02T08:00:00.000Z',
    withFile: false,
  },
];

/**
 * جزوه‌های فیک برای درس‌های ترم باز (همان `courseKey` درس‌ها تا لینک
 * «صفحه جزوات درس» درست resolve شود): کارورزی ۲ سه جزوه، کارورزی ۳ دو جزوه،
 * کارآموزی ۱ یک جزوه، کارورزی ۴ هیچ.
 */
export function buildFakeCourseMaterials(
  courses: readonly LearnerActiveCourse[]
): CourseMaterial[] {
  const specsByCourseId: Record<string, readonly FakeMaterialSpec[]> = {
    'internship-2': FAKE_MATERIAL_SPECS,
    'internship-3': FAKE_MATERIAL_SPECS.slice(0, 2),
    'apprenticeship-1': FAKE_MATERIAL_SPECS.slice(1, 2),
  };

  return courses.flatMap((course) => {
    const specs = specsByCourseId[`${course.kind}-${course.level}`] ?? [];
    return specs.map((spec, index) => ({
      id: `fake-material-${course.kind}-${course.level}-${index}`,
      kind: course.kind,
      courseKey: course.courseKey,
      courseLabel: course.courseTitle,
      title: spec.title,
      description: spec.description,
      fileName: spec.fileName,
      mimeType: 'application/pdf',
      sizeBytes: spec.sizeBytes,
      fileUrl: spec.withFile ? FAKE_DATA_URL_PDF : '',
      authorId: 'fake-supervisor',
      authorRole: 'supervisor_professor' as const,
      authorName: 'دکتر احمدی',
      createdAt: spec.createdAt,
    }));
  });
}

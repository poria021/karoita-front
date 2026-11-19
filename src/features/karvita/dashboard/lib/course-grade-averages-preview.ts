import type { DailyApprovalTrainee } from '@/types/daily-approvals';

import {
  buildCourseGradeAverages,
  type CourseGradeAveragesSummary,
} from './course-grade-averages';

/**
 * پیش‌نمایش باکس «میانگین نمرهٔ دروس» با داده‌ی ماکت (مثل پیش‌نمایش میز کار فراگیر).
 *
 * - `true` (و فقط در development): `WorkbenchCourseAveragesBox` به‌جای داده‌ی واقعی
 *   از `FAKE_COURSE_GRADE_AVERAGES` می‌خواند.
 * - برای برگشت به داده‌ی واقعی این را `false` کنید (یا فایل را پاک کنید).
 * در build تولید (`NODE_ENV === 'production'`) هرگز فعال نمی‌شود.
 */
const FAKE_PREVIEW_SWITCH = true;

export const COURSE_AVERAGES_FAKE_PREVIEW =
  FAKE_PREVIEW_SWITCH && process.env.NODE_ENV !== 'production';

type FakeCourse = {
  kind: DailyApprovalTrainee['kind'];
  level: DailyApprovalTrainee['level'];
  courseKey: DailyApprovalTrainee['courseKey'];
  courseTitle: string;
  /** نمرهٔ نهایی (از ۲۰) فراگیران؛ `null` = هنوز نمره ندارد. */
  grades: ReadonlyArray<number | null>;
};

const FAKE_COURSES: readonly FakeCourse[] = [
  {
    kind: 'internship',
    level: 1,
    courseKey: 'intern1',
    courseTitle: 'کارورزی ۱',
    grades: [18, 16.5, 17, 15, 19, null],
  },
  {
    kind: 'internship',
    level: 2,
    courseKey: 'intern2',
    courseTitle: 'کارورزی ۲',
    grades: [14, 15.5, 13, 16, null],
  },
  {
    kind: 'internship',
    level: 3,
    courseKey: 'intern3',
    courseTitle: 'کارورزی ۳',
    grades: [11, 12.5, 10, 13.5],
  },
  {
    kind: 'internship',
    level: 4,
    courseKey: 'intern4',
    courseTitle: 'کارورزی ۴',
    grades: [17.5, 18.25, 16],
  },
  {
    kind: 'apprenticeship',
    level: 1,
    courseKey: 'appr1',
    courseTitle: 'کارآموزی ۱',
    grades: [19, 18, 17.5, 20],
  },
  {
    kind: 'apprenticeship',
    level: 2,
    courseKey: 'appr2',
    courseTitle: 'کارآموزی ۲',
    grades: [12, 14.5, null, 13],
  },
];

function fakeTrainees(): DailyApprovalTrainee[] {
  return FAKE_COURSES.flatMap((course) =>
    course.grades.map((final20, index) => ({
      id: `fake-${course.courseKey}-${index}`,
      traineeName: `فراگیر ${index + 1}`,
      identifier: `${course.courseKey}-${index + 1}`,
      major: '',
      schoolName: null,
      kind: course.kind,
      level: course.level,
      courseKey: course.courseKey,
      courseTitle: course.courseTitle,
      termId: 'fake-term',
      termTitle: '',
      status: 'active' as const,
      unreadCount: 0,
      hasSubmitted: final20 != null,
      progressiveGrade: {
        gradedCount: final20 == null ? 0 : 1,
        final20,
        statusLabel: final20 == null ? ('فاقد نمره' as const) : ('قبول' as const),
      },
      weeks: [],
    }))
  );
}

/** از همان `buildCourseGradeAverages` واقعی می‌گذرد تا ماکت دقیقاً مسیر اصلی را بیازماید. */
export const FAKE_COURSE_GRADE_AVERAGES: CourseGradeAveragesSummary =
  buildCourseGradeAverages(fakeTrainees());

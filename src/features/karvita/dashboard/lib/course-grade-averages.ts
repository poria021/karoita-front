import { courseNameForKind } from '@/services/internship-enrollment/enrollment-mappers';
import type {
  DailyApprovalCourseKind,
  DailyApprovalTrainee,
} from '@/types/daily-approvals';
import { toPersianDigits } from '@/utils/persianDigits';

import { LEARNER_GRADE_SERIES_COLORS } from './learner-workbench';

/** بالاترین نمرهٔ نهایی درس — محور عمودی نمودار از ۰ تا این مقدار است. */
export const COURSE_GRADE_MAX = 20;

/** رنگ پایهٔ میله‌های نمودار میانگین نمره؛ تُن هر درس از این ساخته می‌شود. */
export const COURSE_BAR_BASE_COLOR = 'var(--kv-brand)';

export type CourseGradeAverage = {
  /** شناسهٔ سری نمودار (ایمن برای `url(#…)` گرادیان). */
  id: string;
  courseKey: string;
  courseTitle: string;
  kind: DailyApprovalCourseKind;
  level: number;
  /** میانگین نمرهٔ نهایی فراگیران نمره‌دارِ درس، از ۲۰. */
  average: number;
  /** شمار فراگیران فعالی که نمرهٔ نهایی دارند و در میانگین آمده‌اند. */
  gradedCount: number;
  color: string;
};

export type CourseGradeAveragesSummary = {
  courses: CourseGradeAverage[];
  /** فهرست فراگیران پیش از رسیدن به آخرین صفحه قطع شده؛ میانگین‌ها تقریبی‌اند. */
  truncated: boolean;
};

type Bucket = {
  courseKey: string;
  courseTitle: string;
  kind: DailyApprovalCourseKind;
  level: number;
  sum: number;
  count: number;
};

function courseTitleFor(trainee: DailyApprovalTrainee): string {
  const title = trainee.courseTitle?.trim();
  if (title) return title;
  return `${courseNameForKind(trainee.kind)} ${toPersianDigits(trainee.level)}`;
}

function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * میانگین نمرهٔ نهایی (از ۲۰) فراگیران هر درس — برای میز کار استاد راهنما.
 * فقط فراگیران فعال با نمرهٔ نهایی عددی می‌شمارند (حذف‌شده‌ها و بدون‌نمره‌ها نه)؛
 * درسی که هیچ نمره‌ای ندارد در خروجی نمی‌آید. ترتیب: کارورزی پیش از کارآموزی،
 * سپس به‌ترتیب سطح.
 */
export function buildCourseGradeAverages(
  trainees: readonly DailyApprovalTrainee[],
  truncated = false
): CourseGradeAveragesSummary {
  const buckets = new Map<string, Bucket>();

  for (const trainee of trainees) {
    if (trainee.status !== 'active') continue;
    const final20 = trainee.progressiveGrade?.final20;
    if (typeof final20 !== 'number' || !Number.isFinite(final20)) continue;

    const key = `${trainee.kind}:${trainee.courseKey}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.sum += final20;
      bucket.count += 1;
    } else {
      buckets.set(key, {
        courseKey: trainee.courseKey,
        courseTitle: courseTitleFor(trainee),
        kind: trainee.kind,
        level: trainee.level,
        sum: final20,
        count: 1,
      });
    }
  }

  const kindOrder = (kind: DailyApprovalCourseKind) =>
    kind === 'internship' ? 0 : 1;

  const courses = [...buckets.values()]
    .sort(
      (a, b) =>
        kindOrder(a.kind) - kindOrder(b.kind) ||
        a.level - b.level ||
        a.courseKey.localeCompare(b.courseKey)
    )
    .map<CourseGradeAverage>((bucket, index) => ({
      id: `course-${index}`,
      courseKey: bucket.courseKey,
      courseTitle: bucket.courseTitle,
      kind: bucket.kind,
      level: bucket.level,
      average: roundTo2(bucket.sum / bucket.count),
      gradedCount: bucket.count,
      color:
        LEARNER_GRADE_SERIES_COLORS[index % LEARNER_GRADE_SERIES_COLORS.length]!,
    }));

  return { courses, truncated };
}

/** ردیف‌های Recharts: محور X = درس، هر درس سریِ خودش (یک نقطه). */
export function buildCourseGradeChartRows(
  courses: readonly CourseGradeAverage[]
): Array<Record<string, string | number | null>> {
  return courses.map((course) => ({
    courseLabel: course.courseTitle,
    [course.id]: course.average,
    [`${course.id}__title`]: `${course.courseTitle} — ${toPersianDigits(course.gradedCount)} فراگیر نمره‌دار`,
  }));
}

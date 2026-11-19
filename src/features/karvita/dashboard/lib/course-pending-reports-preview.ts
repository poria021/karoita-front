import type {
  DailyApprovalTrainee,
  DailyApprovalWeek,
  DailyApprovalWeekState,
} from '@/types/daily-approvals';

import {
  buildCoursePendingReports,
  type CoursePendingReportsSummary,
} from './course-pending-reports';

/**
 * پیش‌نمایش باکس «گزارش‌های در انتظار» با داده‌ی ماکت (مثل میانگین نمره و ظرفیت دروس).
 *
 * - `true` (و فقط در development): باکس به‌جای داده‌ی واقعی از `FAKE_COURSE_PENDING_REPORTS` می‌خواند.
 * - برای برگشت به داده‌ی واقعی این را `false` کنید (یا فایل را پاک کنید).
 * در build تولید (`NODE_ENV === 'production'`) هرگز فعال نمی‌شود.
 */
const FAKE_PREVIEW_SWITCH = true;

export const COURSE_PENDING_REPORTS_FAKE_PREVIEW =
  FAKE_PREVIEW_SWITCH && process.env.NODE_ENV !== 'production';

type FakeCourse = {
  kind: DailyApprovalTrainee['kind'];
  level: DailyApprovalTrainee['level'];
  courseKey: DailyApprovalTrainee['courseKey'];
  courseTitle: string;
  /** وضعیت هفته‌های هر فراگیر. */
  learners: ReadonlyArray<ReadonlyArray<DailyApprovalWeekState>>;
};

const FAKE_COURSES: readonly FakeCourse[] = [
  {
    kind: 'internship',
    level: 1,
    courseKey: 'intern1',
    courseTitle: 'کارورزی ۱',
    learners: [
      ['graded', 'pending', 'pending'],
      ['graded', 'approved', 'pending'],
      ['pending', 'draft'],
      ['graded', 'graded'],
    ],
  },
  {
    kind: 'internship',
    level: 2,
    courseKey: 'intern2',
    courseTitle: 'کارورزی ۲',
    learners: [
      ['pending', 'pending', 'approved'],
      ['approved', 'needs_edit'],
      ['pending'],
    ],
  },
  {
    kind: 'internship',
    level: 3,
    courseKey: 'intern3',
    courseTitle: 'کارورزی ۳',
    learners: [['graded', 'graded'], ['pending']],
  },
  {
    kind: 'internship',
    level: 4,
    courseKey: 'intern4',
    courseTitle: 'کارورزی ۴',
    learners: [['graded'], ['graded', 'graded']],
  },
  {
    kind: 'apprenticeship',
    level: 1,
    courseKey: 'appr1',
    courseTitle: 'کارآموزی ۱',
    learners: [
      ['pending', 'approved', 'pending', 'pending'],
      ['approved', 'approved'],
      ['pending', 'draft'],
    ],
  },
  {
    kind: 'apprenticeship',
    level: 2,
    courseKey: 'appr2',
    courseTitle: 'کارآموزی ۲',
    learners: [['pending', 'graded'], ['draft']],
  },
];

function fakeWeek(status: DailyApprovalWeekState, index: number): DailyApprovalWeek {
  return {
    id: `fake-week-${index + 1}`,
    weekNumber: index + 1,
    status,
    score: null,
    text: '',
    files: [],
    feedback: {},
    readBySupervisor: false,
  };
}

function fakeTrainees(): DailyApprovalTrainee[] {
  return FAKE_COURSES.flatMap((course) =>
    course.learners.map((statuses, index) => ({
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
      hasSubmitted: true,
      progressiveGrade: {
        gradedCount: 0,
        final20: null,
        statusLabel: 'در جریان' as const,
      },
      weeks: statuses.map(fakeWeek),
    }))
  );
}

/** از همان `buildCoursePendingReports` واقعی می‌گذرد تا ماکت دقیقاً مسیر اصلی را بیازماید. */
export const FAKE_COURSE_PENDING_REPORTS: CoursePendingReportsSummary =
  buildCoursePendingReports(fakeTrainees());

import {
  findNextActionableWeekId,
  getTermReportProgress,
} from '@/features/karvita/internship-enrollment/lib/weekly-report-lock';
import { courseNameForKind } from '@/services/internship-enrollment/enrollment-mappers';
import { RouteService } from '@/services/route.service';
import { evaluationCourseFilterId } from '@/services/syllabus-config/course-catalog';
import { catalogIdForKind } from '@/services/syllabus-config/syllabus-mappers';
import type {
  InternshipCourseKind,
  InternshipEnrollmentLevel,
  InternshipEnrollmentPageState,
  InternshipEnrollmentScenario,
  InternshipProgressiveGrade,
  InternshipWeeklySession,
} from '@/types/internship-enrollment';
import { toPersianDigits } from '@/utils/persianDigits';

export type LearnerLevelSnapshot = {
  level: InternshipEnrollmentLevel;
  state: InternshipEnrollmentPageState;
};

export type LearnerNextActionTone = 'action' | 'waiting' | 'blocked' | 'info';

export type LearnerNextAction = {
  tone: LearnerNextActionTone;
  title: string;
  description: string;
  ctaLabel: string | null;
  href: string | null;
  level: InternshipEnrollmentLevel;
  courseLabel: string;
};

export type LearnerWeekStats = {
  total: number;
  overdue: number;
  needsEdit: number;
  pending: number;
  graded: number;
  submittedPercent: number;
  actionableWeekNumber: number | null;
};

export type LearnerActiveCourse = {
  level: InternshipEnrollmentLevel;
  kind: InternshipCourseKind;
  courseTitle: string;
  termTitle: string;
  scenario: InternshipEnrollmentScenario;
  href: string;
  supervisorName: string | null;
  schoolName: string | null;
  mentorName: string | null;
  progressiveGrade: InternshipProgressiveGrade | null;
  weekStats: LearnerWeekStats | null;
  courseKey: string;
  enrolled: boolean;
};

function courseLabel(
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel,
  courseTitle?: string
): string {
  if (courseTitle?.trim()) return courseTitle.trim();
  return `${courseNameForKind(kind)} ${toPersianDigits(level)}`;
}

function weekNumber(
  weeks: InternshipWeeklySession[],
  weekId: string | null
): number | null {
  if (!weekId) return null;
  const index = weeks.findIndex((week) => week.id === weekId);
  return index >= 0 ? index + 1 : null;
}

function buildWeekStats(
  weeks: InternshipWeeklySession[],
  enrollmentStatus: 'active' | 'dropped' | 'completed'
): LearnerWeekStats {
  let overdue = 0;
  let needsEdit = 0;
  let pending = 0;
  let graded = 0;
  for (const week of weeks) {
    if (week.status === 'overdue') overdue += 1;
    else if (week.status === 'needs_edit') needsEdit += 1;
    else if (week.status === 'pending') pending += 1;
    else if (week.status === 'graded' || week.status === 'approved') graded += 1;
  }
  const progress = getTermReportProgress(weeks);
  const actionableId = findNextActionableWeekId(weeks, enrollmentStatus);
  return {
    total: weeks.length,
    overdue,
    needsEdit,
    pending,
    graded,
    submittedPercent: progress.percent,
    actionableWeekNumber: weekNumber(weeks, actionableId),
  };
}

function courseKeyFor(state: InternshipEnrollmentPageState): string {
  return evaluationCourseFilterId(
    state.lessonId ?? catalogIdForKind(state.kind, state.level)
  );
}

/**
 * امتیاز فوریت یک سطح — بالاتر = اولویت نمایش در میز کار.
 * S5 با هفتهٔ قابل‌اقدام / معوق جلوتر از انتخاب واحد باز است.
 */
export function urgencyScore(snapshot: LearnerLevelSnapshot): number {
  const { state } = snapshot;
  const enrollment = state.enrollment;
  const weeks = enrollment?.weeks ?? [];
  const status = enrollment?.status ?? 'active';

  switch (state.scenario) {
    case 'S5_term_active': {
      if (weeks.some((week) => week.status === 'needs_edit')) return 100;
      if (findNextActionableWeekId(weeks, status)) return 92;
      if (weeks.some((week) => week.status === 'overdue')) return 88;
      if (weeks.some((week) => week.status === 'pending')) return 65;
      if (status === 'completed') return 25;
      return 55;
    }
    case 'S3_enroll_open':
      return 80;
    case 'S4_registered_waiting':
      return 70;
    case 'S6_already_enrolled_elsewhere':
      return 50;
    case 'S2_enroll_closed':
      return 40;
    case 'S1_syllabus_blocked':
      return 30;
    default:
      return 10;
  }
}

export function pickFocusSnapshot(
  snapshots: readonly LearnerLevelSnapshot[]
): LearnerLevelSnapshot | null {
  if (snapshots.length === 0) return null;
  return [...snapshots].sort((a, b) => {
    const scoreDiff = urgencyScore(b) - urgencyScore(a);
    if (scoreDiff !== 0) return scoreDiff;
    return a.level - b.level;
  })[0]!;
}

export function buildLearnerNextAction(
  snapshot: LearnerLevelSnapshot
): LearnerNextAction {
  const { level, state } = snapshot;
  const label = courseLabel(state.kind, level, state.courseTitle);
  const href = RouteService.karvita.internshipSelection(level);
  const enrollment = state.enrollment;
  const weeks = enrollment?.weeks ?? [];
  const status = enrollment?.status ?? 'active';
  const actionableId = findNextActionableWeekId(weeks, status);
  const actionableNum = weekNumber(weeks, actionableId);
  const needsEdit = weeks.find((week) => week.status === 'needs_edit');
  const overdueCount = weeks.filter((week) => week.status === 'overdue').length;

  switch (state.scenario) {
    case 'S3_enroll_open':
      return {
        tone: 'action',
        title: `مهلت انتخاب واحد ${label} باز است`,
        description:
          'الان می‌توانید استاد راهنما را انتخاب کنید و ثبت‌نام این سطح را انجام دهید.',
        ctaLabel: 'شروع انتخاب واحد',
        href,
        level,
        courseLabel: label,
      };
    case 'S4_registered_waiting':
      return {
        tone: 'waiting',
        title: `ثبت‌نام ${label} انجام شد`,
        description: `${state.termTitle} هنوز شروع نشده؛ به‌محض فعال شدن ترم، گزارش‌نویسی باز می‌شود.`,
        ctaLabel: 'مشاهده جزئیات',
        href,
        level,
        courseLabel: label,
      };
    case 'S5_term_active': {
      if (needsEdit) {
        const num = weekNumber(weeks, needsEdit.id);
        return {
          tone: 'action',
          title:
            num != null
              ? `گزارش هفته ${toPersianDigits(num)} نیاز به اصلاح دارد`
              : 'یکی از گزارش‌ها نیاز به اصلاح دارد',
          description:
            'بازخورد ناظران را ببینید، گزارش را اصلاح کنید و دوباره ارسال کنید.',
          ctaLabel: 'اصلاح گزارش',
          href,
          level,
          courseLabel: label,
        };
      }
      // هفتهٔ قابل‌اقدام جلوتر از معوق: کاربر هنوز کاری دارد که می‌تواند انجام دهد.
      if (actionableNum != null) {
        return {
          tone: 'action',
          title: `گزارش هفته ${toPersianDigits(actionableNum)} آماده ثبت است`,
          description:
            overdueCount > 0
              ? `ادامهٔ مسیر ${label}؛ ${toPersianDigits(overdueCount)} هفته معوق هم دارید.`
              : `ادامهٔ مسیر ${label} در ${state.termTitle}.`,
          ctaLabel: 'ادامه گزارش',
          href,
          level,
          courseLabel: label,
        };
      }
      if (overdueCount > 0) {
        return {
          tone: 'blocked',
          title: `${toPersianDigits(overdueCount)} هفته معوق دارید`,
          description:
            'مهلت قانونی این هفته‌ها گذشته است. برای تمدید با استاد راهنما هماهنگ کنید.',
          ctaLabel: 'مشاهده هفته‌ها',
          href,
          level,
          courseLabel: label,
        };
      }
      if (weeks.some((week) => week.status === 'pending')) {
        return {
          tone: 'waiting',
          title: 'گزارش‌ها در انتظار بررسی ناظران است',
          description:
            'ارسال شما ثبت شده؛ تا زمان تأیید استاد یا معلم راهنما اقدام جدیدی لازم نیست.',
          ctaLabel: 'مشاهده وضعیت',
          href,
          level,
          courseLabel: label,
        };
      }
      return {
        tone: 'info',
        title: `${label} در جریان است`,
        description: `ترم ${state.termTitle} فعال است. وضعیت هفته‌ها را از صفحهٔ درس ببینید.`,
        ctaLabel: 'رفتن به درس',
        href,
        level,
        courseLabel: label,
      };
    }
    case 'S6_already_enrolled_elsewhere': {
      const conflict = state.conflictEnrollment;
      const conflictHref = conflict
        ? RouteService.karvita.internshipSelection(conflict.level)
        : href;
      return {
        tone: 'info',
        title: 'در درس دیگری از این ترم ثبت‌نام دارید',
        description: conflict
          ? `الان ${conflict.courseTitle} فعال است؛ تا پایان همان درس نمی‌توانید ${label} را بگیرید.`
          : `برای ${label} فعلاً امکان ثبت‌نام موازی نیست.`,
        ctaLabel: conflict ? 'رفتن به درس فعال' : null,
        href: conflict ? conflictHref : null,
        level,
        courseLabel: label,
      };
    }
    case 'S2_enroll_closed':
      return {
        tone: 'blocked',
        title: `مهلت انتخاب واحد ${label} بسته است`,
        description:
          'در این بازه امکان ثبت‌نام جدید نیست. وضعیت ترم بعدی را از اطلاعیه‌ها دنبال کنید.',
        ctaLabel: 'مشاهده صفحه درس',
        href,
        level,
        courseLabel: label,
      };
    case 'S1_syllabus_blocked':
      return {
        tone: 'blocked',
        title: `${label} هنوز فعال نشده`,
        description:
          'سرفصل این سطح از طرف سامانه باز نشده است. فعلاً اقدامی برای شما وجود ندارد.',
        ctaLabel: null,
        href: null,
        level,
        courseLabel: label,
      };
    default:
      return {
        tone: 'info',
        title: 'میز کار آماده است',
        description: 'به‌محض باز شدن انتخاب واحد یا ترم فعال، اقدام بعدی اینجا می‌آید.',
        ctaLabel: null,
        href: null,
        level,
        courseLabel: label,
      };
  }
}

export function buildLearnerActiveCourse(
  snapshot: LearnerLevelSnapshot
): LearnerActiveCourse {
  const { level, state } = snapshot;
  const enrollment = state.enrollment;
  const enrolled = Boolean(
    enrollment &&
      (state.scenario === 'S4_registered_waiting' ||
        state.scenario === 'S5_term_active')
  );

  return {
    level,
    kind: state.kind,
    courseTitle: courseLabel(state.kind, level, state.courseTitle ?? enrollment?.courseTitle),
    termTitle: enrollment?.termTitle || state.termTitle,
    scenario: state.scenario,
    href: RouteService.karvita.internshipSelection(level),
    supervisorName: enrollment?.supervisorName ?? null,
    schoolName: enrollment?.schoolName ?? null,
    mentorName: enrollment?.mentorName ?? null,
    progressiveGrade: enrollment?.progressiveGrade ?? null,
    weekStats:
      enrolled && enrollment
        ? buildWeekStats(enrollment.weeks, enrollment.status)
        : null,
    courseKey: courseKeyFor(state),
    enrolled,
  };
}

/** ثبت‌نام غیرلغوشدهٔ همین نیم‌سال باز — نه سابقهٔ ترم‌های قبل. */
export function isOpenTermEnrollment(snapshot: LearnerLevelSnapshot): boolean {
  const { state } = snapshot;
  const enrollment = state.enrollment;
  if (!enrollment || enrollment.status === 'dropped') return false;
  if (
    state.scenario !== 'S4_registered_waiting' &&
    state.scenario !== 'S5_term_active'
  ) {
    return false;
  }
  if (!state.openTermId) return false;
  return state.termId === state.openTermId;
}

/** یک کارت برای هر درسی که در نیم‌سال باز انتخاب واحد شده، به ترتیب سطح. */
export function buildOpenTermCourses(
  snapshots: readonly LearnerLevelSnapshot[]
): LearnerActiveCourse[] {
  return snapshots
    .filter(isOpenTermEnrollment)
    .sort((a, b) => a.level - b.level)
    .map(buildLearnerActiveCourse);
}

export function buildLearnerWorkbenchModels(
  snapshots: readonly LearnerLevelSnapshot[]
): {
  focus: LearnerLevelSnapshot | null;
  nextAction: LearnerNextAction | null;
  activeCourse: LearnerActiveCourse | null;
  openTermCourses: LearnerActiveCourse[];
} {
  const focus = pickFocusSnapshot(snapshots);
  const openTermCourses = buildOpenTermCourses(snapshots);
  if (!focus) {
    return { focus: null, nextAction: null, activeCourse: null, openTermCourses };
  }
  return {
    focus,
    nextAction: buildLearnerNextAction(focus),
    activeCourse: buildLearnerActiveCourse(focus),
    openTermCourses,
  };
}

/** رنگ‌های سری نمودار — فقط توکن CSS، بدون هگز در TS. */
export const LEARNER_GRADE_SERIES_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--kv-violet)',
] as const;

export type LearnerGradeWeekPoint = {
  weekNumber: number;
  weekTitle: string;
  score: number | null;
  status: InternshipWeeklySession['status'];
};

export type LearnerGradeSeries = {
  id: string;
  courseTitle: string;
  level: InternshipEnrollmentLevel;
  kind: InternshipCourseKind;
  color: string;
  weeks: LearnerGradeWeekPoint[];
};

export type LearnerGradeChartRow = {
  weekNumber: number;
  weekLabel: string;
} & Record<string, number | string | null>;

/**
 * سری نمرهٔ هفتگی درس‌های نیم‌سال باز — از همان snapshotهای ثبت‌نام.
 * فقط هفته‌های نمره‌دار روی نمودار نقطه می‌گیرند؛ بقیه null می‌مانند.
 */
export function buildLearnerGradeSeries(
  snapshots: readonly LearnerLevelSnapshot[]
): LearnerGradeSeries[] {
  return snapshots
    .filter(isOpenTermEnrollment)
    .sort((a, b) => a.level - b.level)
    .map((snapshot, index) => {
      const course = buildLearnerActiveCourse(snapshot);
      const weeks = (snapshot.state.enrollment?.weeks ?? []).map((week, weekIndex) => ({
        weekNumber: weekIndex + 1,
        weekTitle: week.title?.trim() || `هفته ${toPersianDigits(weekIndex + 1)}`,
        score:
          week.status === 'graded' && typeof week.score === 'number'
            ? week.score
            : null,
        status: week.status,
      }));

      return {
        id: `${course.kind}-${course.level}`,
        courseTitle: course.courseTitle,
        level: course.level,
        kind: course.kind,
        color:
          LEARNER_GRADE_SERIES_COLORS[index % LEARNER_GRADE_SERIES_COLORS.length]!,
        weeks,
      };
    });
}

/** ردیف‌های Recharts: محور X = شماره هفته، هر درس یک کلید نمره. */
export function buildLearnerGradeChartRows(
  series: readonly LearnerGradeSeries[]
): LearnerGradeChartRow[] {
  const maxWeek = series.reduce(
    (max, item) => Math.max(max, item.weeks.length),
    0
  );
  if (maxWeek === 0) return [];

  const rows: LearnerGradeChartRow[] = [];
  for (let weekNumber = 1; weekNumber <= maxWeek; weekNumber += 1) {
    const row: LearnerGradeChartRow = {
      weekNumber,
      weekLabel: `هفته ${toPersianDigits(weekNumber)}`,
    };
    for (const item of series) {
      const point = item.weeks[weekNumber - 1];
      row[item.id] = point?.score ?? null;
      row[`${item.id}__title`] = point?.weekTitle ?? row.weekLabel;
    }
    rows.push(row);
  }
  return rows;
}

export type LearnerTeacherReactionRole = 'advisor' | 'mentor' | 'principal';

export type LearnerCourseWeekHighlight = {
  /** هم‌کلید با سری نمودار برای فیلتر مشترک. */
  id: string;
  courseTitle: string;
  href: string;
  color: string;
  weekNumber: number;
  weekTitle: string;
  status: InternshipWeeklySession['status'];
  score: number | null;
  hasTeacherReaction: boolean;
  reactionRole: LearnerTeacherReactionRole | null;
  reactionText: string | null;
  reactionAt: string | null;
  supervisorName: string | null;
  mentorName: string | null;
};

function latestUnlockedWeekIndex(weeks: readonly InternshipWeeklySession[]): number {
  for (let index = weeks.length - 1; index >= 0; index -= 1) {
    if (weeks[index]!.status !== 'locked_future') return index;
  }
  return Math.max(0, weeks.length - 1);
}

function extractTeacherReaction(week: InternshipWeeklySession): {
  hasReaction: boolean;
  role: LearnerTeacherReactionRole | null;
  text: string | null;
  at: string | null;
} {
  const feedback = week.feedback;
  if (feedback?.advisor?.trim()) {
    return {
      hasReaction: true,
      role: 'advisor',
      text: feedback.advisor.trim(),
      at: feedback.advisorAt ?? null,
    };
  }
  if (feedback?.mentor?.trim()) {
    return {
      hasReaction: true,
      role: 'mentor',
      text: feedback.mentor.trim(),
      at: feedback.mentorAt ?? null,
    };
  }
  if (feedback?.principal?.trim()) {
    return {
      hasReaction: true,
      role: 'principal',
      text: feedback.principal.trim(),
      at: feedback.principalAt ?? null,
    };
  }
  if (feedback?.mentorRating || feedback?.principalRating) {
    return {
      hasReaction: true,
      role: feedback.mentorRating ? 'mentor' : 'principal',
      text: null,
      at: feedback.mentorAt ?? feedback.principalAt ?? null,
    };
  }
  if (
    week.status === 'needs_edit' ||
    week.status === 'graded' ||
    week.status === 'approved'
  ) {
    return { hasReaction: true, role: null, text: null, at: null };
  }
  return { hasReaction: false, role: null, text: null, at: null };
}

/**
 * هفتهٔ ویژهٔ کارت درس: ترجیح با آخرین هفتهٔ دارای واکنش ناظر؛
 * وگرنه آخرین هفتهٔ باز (غیر locked_future).
 */
export function pickLearnerFeaturedWeek(
  weeks: readonly InternshipWeeklySession[]
): {
  week: InternshipWeeklySession;
  weekNumber: number;
  hasTeacherReaction: boolean;
} | null {
  if (weeks.length === 0) return null;

  const latestIndex = latestUnlockedWeekIndex(weeks);
  const latest = weeks[latestIndex]!;
  const latestReaction = extractTeacherReaction(latest);
  if (latestReaction.hasReaction) {
    return {
      week: latest,
      weekNumber: latestIndex + 1,
      hasTeacherReaction: true,
    };
  }

  for (let index = weeks.length - 1; index >= 0; index -= 1) {
    const week = weeks[index]!;
    if (!extractTeacherReaction(week).hasReaction) continue;
    return {
      week,
      weekNumber: index + 1,
      hasTeacherReaction: true,
    };
  }

  return {
    week: latest,
    weekNumber: latestIndex + 1,
    hasTeacherReaction: false,
  };
}

/** یک کارت هفتهٔ ویژه برای هر درس ثبت‌نام‌شدهٔ نیم‌سال باز. */
export function buildLearnerCourseWeekHighlights(
  snapshots: readonly LearnerLevelSnapshot[]
): LearnerCourseWeekHighlight[] {
  return snapshots
    .filter(isOpenTermEnrollment)
    .sort((a, b) => a.level - b.level)
    .flatMap((snapshot, index) => {
      const course = buildLearnerActiveCourse(snapshot);
      const weeks = snapshot.state.enrollment?.weeks ?? [];
      const featured = pickLearnerFeaturedWeek(weeks);
      if (!featured) return [];

      const reaction = extractTeacherReaction(featured.week);
      const highlight: LearnerCourseWeekHighlight = {
        id: `${course.kind}-${course.level}`,
        courseTitle: course.courseTitle,
        href: course.href,
        color:
          LEARNER_GRADE_SERIES_COLORS[
            index % LEARNER_GRADE_SERIES_COLORS.length
          ]!,
        weekNumber: featured.weekNumber,
        weekTitle:
          featured.week.title?.trim() ||
          `هفته ${toPersianDigits(featured.weekNumber)}`,
        status: featured.week.status,
        score:
          featured.week.status === 'graded' &&
          typeof featured.week.score === 'number'
            ? featured.week.score
            : null,
        hasTeacherReaction: featured.hasTeacherReaction,
        reactionRole: reaction.role,
        reactionText: reaction.text,
        reactionAt: reaction.at,
        supervisorName: course.supervisorName,
        mentorName: course.mentorName,
      };
      return [highlight];
    });
}

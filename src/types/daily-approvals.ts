import type {
  InternshipCompetencyRating,
  InternshipCourseKind,
  InternshipEnrollmentLevel,
  InternshipWeeklyReportFeedback,
  InternshipWeeklyReportFile,
  InternshipWeeklySessionState,
} from '@/types/internship-enrollment';
import type { OffsetLimitPage } from '@/utils/offset-limit-page';

export type DailyApprovalCompetencyRating = InternshipCompetencyRating;

export type DailyApprovalCourseKind = InternshipCourseKind;

/** فیلتر خوانده/وضعیت از مرجع `readFilterStatus`. */
export type DailyApprovalReadFilter = 'all' | 'read' | 'unread' | 'dropped';

/**
 * فیلتر درس از مرجع `selectedCourse` / `getGradingCourses()`.
 * مقدار در state/API انگلیسی می‌ماند؛ برچسب UI فارسی است.
 */
export type DailyApprovalCourseFilter =
  | 'all'
  | 'intern1'
  | 'intern2'
  | 'intern3'
  | 'intern4'
  | 'appr1'
  | 'appr2';

export type DailyApprovalCatalogCourse = {
  id: string;
  title: string;
  courseFilter: Exclude<DailyApprovalCourseFilter, 'all'>;
};

export type DailyApprovalWeekOption = {
  value: string;
  label: string;
  weekNumber: number;
};

export type DailyApprovalTraineeStatus = 'active' | 'dropped';

export type DailyApprovalWeekState = InternshipWeeklySessionState;

export type DailyApprovalAttachment = InternshipWeeklyReportFile & {
  url?: string;
};

export type DailyApprovalWeek = {
  id: string;
  weekNumber: number;
  status: DailyApprovalWeekState;
  score: number | null;
  text: string;
  files: DailyApprovalAttachment[];
  /** زمان (ISO) آخرین ارسال گزارش فراگیر برای این هفته. */
  submittedAt?: string | null;
  feedback: InternshipWeeklyReportFeedback;
  readBySupervisor: boolean;
  isExtended?: boolean;
};

export type DailyApprovalProgressiveGrade = {
  gradedCount: number;
  final20: number | null;
  statusLabel: 'در جریان' | 'فاقد نمره' | 'قبول' | 'مردود' | 'حذف';
};

export type DailyApprovalTrainee = {
  id: string;
  traineeName: string;
  identifier: string;
  major: string;
  schoolName: string | null;
  kind: DailyApprovalCourseKind;
  level: InternshipEnrollmentLevel;
  courseKey: Exclude<DailyApprovalCourseFilter, 'all'>;
  courseTitle: string;
  termId: string;
  termTitle: string;
  status: DailyApprovalTraineeStatus;
  unreadCount: number;
  hasSubmitted: boolean;
  progressiveGrade: DailyApprovalProgressiveGrade;
  weeks: DailyApprovalWeek[];
  /** فقط real — برای تشخیص پیام معلم در گفتگوی هفته (ببین `loadRealDailyApprovalWeekDetail`). */
  teacherId?: string | null;
};

/** جزئیات یک هفته که فقط به‌درخواست (موقع باز شدن مودال) خوانده می‌شود، نه در لیست. */
export type DailyApprovalWeekDetail = {
  text: string;
  files: DailyApprovalAttachment[];
  submittedAt?: string | null;
  feedback: InternshipWeeklyReportFeedback;
};

export type ListDailyApprovalsInput = {
  kind: DailyApprovalCourseKind;
  query: string;
  readFilter: DailyApprovalReadFilter;
  course: DailyApprovalCourseFilter;
  termId: string;
  offset: number;
  limit: number;
};

export type ListDailyApprovalsPage = OffsetLimitPage<DailyApprovalTrainee> & {
  terms: Array<{ id: string; title: string }>;
};

export type UpdateDailyApprovalWeekInput = {
  traineeId: string;
  weekId: string;
  /** ASCII ۰–۱۰۰؛ خالی/`null` + بازخورد → `needs_edit`. */
  score: number | null;
  advisorFeedback: string;
};

/** برای معلم راهنما امتیاز الزامی است؛ بازخورد متنی اختیاری. */
export type UpdateMentorDailyApprovalWeekInput = {
  traineeId: string;
  weekId: string;
  mentorFeedback: string;
  mentorRating: DailyApprovalCompetencyRating;
};

/** برای مدیر مدرسه امتیاز اختیاری است — می‌تواند فقط یکی از امتیاز/بازخورد را ثبت کند. */
export type UpdatePrincipalDailyApprovalWeekInput = {
  traineeId: string;
  weekId: string;
  principalFeedback: string;
  principalRating: DailyApprovalCompetencyRating | null;
};

export type ExtendDailyApprovalWeekInput = {
  traineeId: string;
  weekId: string;
};

/** بازگشایی گروهی هفته‌ها برای گروه kind/ترم/درس فعال. */
export type BulkExtendDailyApprovalWeeksInput = {
  kind: DailyApprovalCourseKind;
  termId: string;
  course: DailyApprovalCourseFilter;
  /** شماره هفته انگلیسی (`1…N`) برای تمدید / نگه‌داشتن تمدید. */
  weekNumbers: number[];
  /**
   * هفته‌هایی که قبلاً تمدید شده و باید لغو شوند (مهلت به overdue برمی‌گردد).
   */
  revokeWeekNumbers?: number[];
};

export type BulkExtendDailyApprovalWeeksResult = {
  affectedTraineeCount: number;
  extendedPairCount: number;
  revokedPairCount: number;
};

export type DropDailyApprovalTraineeInput = {
  traineeId: string;
};

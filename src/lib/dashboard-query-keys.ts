import type { QueryClient } from '@tanstack/react-query';

/**
 * Query key prefixes for dashboard server-state.
 * After a mutation, invalidate every consumer of that catalog — do not
 * keep a second copy of the list in `useDashboardModuleCache.setData`.
 */
export const DASHBOARD_QUERY = {
  syllabusSnapshot: ['syllabus-config', 'snapshot'] as const,
  syllabusCourseCatalog: ['syllabus-config', 'course-catalog'] as const,
  passingScoreThreshold: ['syllabus-config', 'passing-threshold'] as const,
  orgCapacities: ['org-capacities'] as const,
  orgCapacitiesTerms: (kind: string) =>
    ['org-capacities', 'terms', kind] as const,
  orgCapacitiesSnapshot: (kind: string, termId: string) =>
    ['org-capacities', 'snapshot', kind, termId] as const,
  /** GET student-enrollments/mentor/capacity — کارت‌های کل / پذیرش قطعی / باقی‌مانده استاد راهنما. */
  orgCapacitiesMentor: (termId: string) =>
    ['org-capacities', 'mentor-capacity', termId] as const,
  dailyApprovalsTerms: (kind: string) =>
    ['daily-approvals', 'terms', kind] as const,
  dailyApprovalsCourses: (kind: string, termId: string) =>
    ['daily-approvals', 'courses', kind, termId] as const,
  /**
   * فراگیران ترم باز روی میز کار استاد، معلم راهنما و مدیر مدرسه — منبع مشترک
   * باکس‌های شمار فراگیران/معلمان و میانگین نمرهٔ دروس (هر دو با `select`).
   */
  dashboardTrainees: (role: string) =>
    ['daily-approvals', 'dashboard-trainees', role] as const,
  /**
   * `GET /reports/lessons/average-scores` — نمودار «میانگین نمرهٔ دروس».
   * `semesterId`/`structure` خالی = همهٔ نیم‌سال‌ها؛ با تغییر هرکدام دوباره گرفته می‌شود.
   */
  lessonAverageScores: (role: string, semesterId = '', structure = '') =>
    ['reports', 'lessons', 'average-scores', role, semesterId, structure] as const,
  /** `GET /reports/lessons/pending-reviews` — کارت‌های «در انتظار بررسی». */
  lessonPendingReviews: (role: string, semesterId = '', structure = '') =>
    ['reports', 'lessons', 'pending-reviews', role, semesterId, structure] as const,
  internshipEnrollment: ['internship-enrollment'] as const,
  /** نیم‌سال جاری (ترمی/پودمان) برای باکس خوش‌آمد پنل‌های غیر فراگیر. */
  currentTerms: ['current-terms'] as const,
  orgOptions: ['org-options'] as const,
  onboardingApprovalsProvinces: ['onboarding-approvals', 'provinces'] as const,
  /** خلاصهٔ وضعیت تأیید مدارک روی میز کار مدیر ارشد. */
  onboardingApprovalsSummary: (status: string) =>
    ['onboarding-approvals', 'dashboard-summary', status] as const,
  /** `GET /reports/schools` (همهٔ صفحه‌ها) — شمار مدارس/معلمان/فراگیران میز کار آموزش و پرورش منطقه. */
  regionalSchools: ['reports', 'dashboard-regional-schools'] as const,
  /**
   * آمار میز کار مدیر دانشکده — professors + school-performance + learners
   * (همهٔ صفحه‌ها؛ محدوده را بک‌اند از کاربر لاگین‌شده می‌گیرد).
   */
  facultyCounts: ['reports', 'dashboard-faculty-counts'] as const,
  /**
   * ردیف‌های خام `professors|faculties/performance` — مشترک آمار، نرخ پاسخ،
   * رتبه‌بندی نمره و رتبه‌بندی حضور (یک fetch، چند `select`).
   */
  facultyPerformanceRows: (slug: string) =>
    ['reports', 'dashboard-faculty-performance-rows', slug] as const,
  /** توزیع/میانگین نرخ پاسخ‌دهی اساتید دانشکده روی میز کار مدیر دانشکده. */
  facultyResponseRate: ['reports', 'dashboard-faculty-response-rate'] as const,
  /** ۵ استاد ضعیف/قوی دانشکده بر اساس درصد حضور روی میز کار مدیر دانشکده. */
  professorAttendanceRanking: (role: string) =>
    ['reports', 'dashboard-professor-attendance-ranking', role] as const,
  /** ۵ استاد ضعیف/قوی دانشکده بر اساس میانگین نمره روی نمودار میز کار مدیر دانشکده. */
  professorScoreRanking: (role: string) =>
    ['reports', 'dashboard-professor-score-ranking', role] as const,
  /** `GET /users/documents/status` — نمودار «وضعیت پرونده‌ها» روی میز کار مدیر ارشد. */
  usersDocumentsStatus: ['users', 'documents-status'] as const,
  /** `GET /users/dashboard/counts` — شمار مکان‌ها و کاربران هر نقش (میز کار ادمین). */
  usersDashboardCounts: ['users', 'dashboard-counts'] as const,
  /** ۳ استان/دانشکدهٔ ضعیف یا قوی روی میز کار ادمین. */
  performanceRanking: (entity: string, direction: string) =>
    ['reports', 'dashboard-performance', entity, direction] as const,
  /** ۵ مدرسهٔ ضعیف/قوی منطقه بر اساس میانگین نمره روی میز کار آموزش و پرورش. */
  schoolRanking: (role: string) =>
    ['reports', 'dashboard-school-ranking', role] as const,
  /**
   * ۶ استان ضعیف/قوی بر اساس میانگین نمره — میز کار سازمان مرکزی
   * (`GET v1/reports/provinces/performance`).
   */
  provinceRanking: (role: string) =>
    ['reports', 'dashboard-province-ranking', role] as const,
  /** ۵ معلم ضعیف/قوی مدرسه بر اساس نرخ پاسخ‌دهی روی میز کار مدیر مدرسه. */
  teacherResponseRanking: (role: string) =>
    ['reports', 'dashboard-teacher-response-ranking', role] as const,
  /** پیشوند مشترک داشبورد و صفحهٔ مدیریت — بعد از mutation هر دو باطل شوند. */
  bulletins: ['bulletins'] as const,
  bulletinsDashboard: ['bulletins', 'dashboard'] as const,
  /** هاب دریافتی‌ها — فقط `type=info`؛ با کش میز کار (ads+info) قاطی نشود. */
  bulletinsReceived: ['bulletins', 'received'] as const,
  bulletinsManaged: ['bulletins', 'managed'] as const,
  /** آمار تبلیغ‌ها (کلیک/نمایش/وضعیت) روی میز کار مدیر ارشد — زیر پیشوند bulletins. */
  courseMaterials: ['course-materials'] as const,
  courseMaterialsReceived: ['course-materials', 'received'] as const,
  courseMaterialsManaged: ['course-materials', 'managed'] as const,
  /** پیشوند مشترک دسترسی گزارش‌ها — بعد از PATCH سوییچ هر دو زیرکلید باطل شوند. */
  reportAccess: ['report-access'] as const,
  /** منوی گزارش کاربر جاری (`GET /reports/access/me`) — سایدبار و گارد صفحه. */
  reportAccessMe: (role: string) => ['report-access', 'me', role] as const,
  /** ماتریس همهٔ نقش‌ها (`GET /reports/access`) — صفحهٔ مدیریت دسترسی. */
  reportAccessMatrix: ['report-access', 'matrix'] as const,
} as const;

/** Capacity, daily-approvals, and enrollment all read Nest semesters. */
export function invalidateAcademicTermConsumers(
  queryClient: QueryClient
): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: DASHBOARD_QUERY.orgCapacities,
    }),
    queryClient.invalidateQueries({ queryKey: ['daily-approvals'] }),
    queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY.currentTerms }),
    queryClient.invalidateQueries({
      queryKey: DASHBOARD_QUERY.internshipEnrollment,
    }),
    queryClient.invalidateQueries({
      queryKey: DASHBOARD_QUERY.passingScoreThreshold,
    }),
    queryClient.invalidateQueries({ queryKey: ['reports', 'lessons'] }),
  ]).then(() => undefined);
}

/** Typeahead and onboarding filters read the same org directory. */
export function invalidateOrganizationDirectoryConsumers(
  queryClient: QueryClient
): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY.orgOptions }),
    queryClient.invalidateQueries({
      queryKey: DASHBOARD_QUERY.onboardingApprovalsProvinces,
    }),
    queryClient.invalidateQueries({
      queryKey: DASHBOARD_QUERY.usersDashboardCounts,
    }),
  ]).then(() => undefined);
}

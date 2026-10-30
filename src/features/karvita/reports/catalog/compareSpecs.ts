/**
 * مشخصات مقایسه برای هر گزارش comparable:
 * - مقایسه روی همان موضوع گزارش (دانشجو، مدرسه، معلم، …)
 * - فیلترهای مقایسه‌ای جدا از فیلترهای گزارش پایه
 * - حداکثر ۴ موجودیت
 */

export const COMPARATIVE_MAX_ENTITIES = 4;
export const COMPARATIVE_MIN_ENTITIES = 2;

export type CompareMetricDef = {
  key: string;
  label: string;
  /** اگر true، مقدار درصد/نرخ است (۰–۱۰۰). */
  asPercent?: boolean;
};

export type ReportCompareSpec = {
  /** کلید ستون هویت موجودیت در ردیف‌های گزارش */
  entityKey: string;
  /** برچسب نوع موجودیت برای UI */
  entityLabel: string;
  hint: string;
  /** فیلترهای مخصوص حالت مقایسه‌ای (جدا از فیلتر استاندارد) */
  filters: readonly string[];
  metrics: readonly CompareMetricDef[];
};

export const REPORT_COMPARE_SPECS: Record<string, ReportCompareSpec> = {
  trainee_list: {
    entityKey: 'name',
    entityLabel: 'کارورز',
    hint: 'کارورزان را از نظر دوره و روز کارورزی مقایسه کنید',
    filters: ['termId', 'audience', 'courseId', 'schoolId'],
    metrics: [
      { key: 'internshipDays', label: 'روز کارورزی' },
    ],
  },
  attendance_days: {
    entityKey: 'traineeName',
    entityLabel: 'کارورز',
    hint: 'روزهای حضور/غیبت کارورزان را با هم مقایسه کنید',
    filters: ['termId', 'schoolId', 'collegeId'],
    metrics: [
      { key: 'presentDaysCount', label: 'روز حضور' },
      { key: 'absentDaysCount', label: 'روز عدم حضور' },
    ],
  },
  student_uploads: {
    entityKey: 'traineeName',
    entityLabel: 'دانشجو',
    hint: 'حجم بارگذاری فعالیت دانشجویان را مقایسه کنید',
    filters: ['termId', 'courseId'],
    metrics: [{ key: 'weekNo', label: 'شماره هفته' }],
  },
  activity_delays: {
    entityKey: 'traineeName',
    entityLabel: 'دانشجو',
    hint: 'تأخیر ثبت فعالیت دانشجویان را مقایسه کنید',
    filters: ['termId', 'weekStatus'],
    metrics: [{ key: 'weekNo', label: 'هفته معوق' }],
  },
  activity_feedbacks: {
    entityKey: 'traineeName',
    entityLabel: 'کارورز',
    hint: 'امتیاز بازخورد فعالیت‌های کارورزان را مقایسه کنید',
    filters: ['termId', 'feedbackRole'],
    metrics: [{ key: 'rating', label: 'امتیاز بازخورد' }],
  },
  final_grades: {
    entityKey: 'traineeName',
    entityLabel: 'کارورز',
    hint: 'نمرات پایانی کارورزان را با هم مقایسه کنید',
    filters: ['termId', 'courseId'],
    metrics: [
      { key: 'mentorAvg', label: 'میانگین معلم' },
      { key: 'principalAvg', label: 'میانگین مدیر' },
      { key: 'supervisorFinal', label: 'نمره استاد' },
      { key: 'total20', label: 'از ۲۰' },
    ],
  },
  grades_by_supervisor: {
    entityKey: 'traineeName',
    entityLabel: 'کارورز',
    hint: 'نمرات کارورزان (به تفکیک استاد) را مقایسه کنید',
    filters: ['termId', 'supervisorId', 'collegeId'],
    metrics: [{ key: 'total20', label: 'نمره از ۲۰' }],
  },
  mentors_list: {
    entityKey: 'personName',
    entityLabel: 'معلم راهنما',
    hint: 'معلمان راهنما را از نظر تعداد کارورز مقایسه کنید',
    filters: ['termId', 'provinceId', 'schoolId'],
    metrics: [{ key: 'traineeCount', label: 'تعداد کارورز' }],
  },
  principals_list: {
    entityKey: 'personName',
    entityLabel: 'مدیر مدرسه',
    hint: 'مدیران مدارس را از نظر تعداد کارورز مقایسه کنید',
    filters: ['termId', 'provinceId', 'schoolId'],
    metrics: [{ key: 'traineeCount', label: 'تعداد کارورز' }],
  },
  supervisors_directory: {
    entityKey: 'personName',
    entityLabel: 'استاد راهنما',
    hint: 'استادان راهنما را از نظر پوشش کارورز مقایسه کنید',
    filters: ['termId', 'provinceId', 'collegeId'],
    metrics: [{ key: 'traineeCount', label: 'تعداد کارورز' }],
  },
  active_schools_list: {
    entityKey: 'school',
    entityLabel: 'مدرسه',
    hint: 'مدارس فعال را از نظر ظرفیت کارورز و معلم مقایسه کنید',
    filters: ['termId', 'courseId', 'gender', 'weekday'],
    metrics: [
      { key: 'traineeCount', label: 'تعداد کارورز' },
      { key: 'mentorCount', label: 'تعداد معلم' },
    ],
  },
  schools_directory: {
    entityKey: 'school',
    entityLabel: 'مدرسه',
    hint: 'مدارس را از نظر تعداد کارورز مقایسه کنید',
    filters: ['termId', 'provinceId', 'cityId', 'collegeId'],
    metrics: [{ key: 'traineeCount', label: 'تعداد کارورز' }],
  },
  districts_active_list: {
    entityKey: 'place',
    entityLabel: 'شهر/منطقه',
    hint: 'مناطق فعال را از نظر مدرسه، معلم و کارورز مقایسه کنید',
    filters: ['termId', 'provinceId'],
    metrics: [
      { key: 'schoolsCount', label: 'تعداد مدرسه' },
      { key: 'mentorsCount', label: 'تعداد معلم' },
      { key: 'traineesCount', label: 'تعداد کارورز' },
    ],
  },
  mentor_feedback_performance: {
    entityKey: 'entityName',
    entityLabel: 'معلم راهنما',
    hint: 'عملکرد بازخورد معلمان را مقایسه کنید',
    filters: ['termId', 'schoolId'],
    metrics: [
      { key: 'responseRate', label: 'نرخ پاسخ', asPercent: true },
      { key: 'avgRating', label: 'میانگین بازخورد' },
      { key: 'feedbackCount', label: 'حجم بازخورد' },
    ],
  },
  principal_feedback_performance: {
    entityKey: 'entityName',
    entityLabel: 'مدیر مدرسه',
    hint: 'عملکرد بازخورد مدیران را مقایسه کنید',
    filters: ['termId', 'districtId'],
    metrics: [
      { key: 'responseRate', label: 'نرخ پاسخ', asPercent: true },
      { key: 'avgRating', label: 'میانگین بازخورد' },
    ],
  },
  supervisor_feedback_performance: {
    entityKey: 'entityName',
    entityLabel: 'استاد راهنما',
    hint: 'عملکرد بازخورد استادان را مقایسه کنید',
    filters: ['termId', 'collegeId'],
    metrics: [
      { key: 'responseRate', label: 'نرخ اقدام', asPercent: true },
      { key: 'avgRating', label: 'میانگین نمره' },
    ],
  },
  staff_feedback_performance: {
    entityKey: 'entityName',
    entityLabel: 'کادر (مدیر/معلم)',
    hint: 'عملکرد بازخورد مدیر و معلمان را مقایسه کنید',
    filters: ['termId', 'districtId', 'cityId'],
    metrics: [
      { key: 'responseRate', label: 'نرخ پاسخ', asPercent: true },
      { key: 'avgRating', label: 'میانگین' },
    ],
  },
  college_feedback_performance: {
    entityKey: 'entityName',
    entityLabel: 'دانشکده',
    hint: 'عملکرد دانشکده‌ها بر مبنای بازخورد استادان را مقایسه کنید',
    filters: ['termId'],
    metrics: [
      { key: 'traineesCovered', label: 'تعداد استاد' },
      { key: 'responseRate', label: 'نرخ اقدام', asPercent: true },
      { key: 'avgRating', label: 'میانگین' },
    ],
  },
  supervisor_school_visits: {
    entityKey: 'supervisorName',
    entityLabel: 'استاد راهنما',
    hint: 'تعداد جلسات حضور استادان در مدارس را مقایسه کنید',
    filters: ['termId', 'collegeId', 'schoolId'],
    metrics: [{ key: 'visitDaysCount', label: 'تعداد جلسات' }],
  },
  province_college_supervisor_perf: {
    entityKey: 'scope',
    entityLabel: 'دانشکده',
    hint: 'عملکرد دانشکده‌ها (بازخورد استادان) را در استان مقایسه کنید',
    filters: ['termId', 'provinceId'],
    metrics: [
      { key: 'responseRate', label: 'نرخ اقدام', asPercent: true },
      { key: 'avgRating', label: 'میانگین' },
    ],
  },
  province_college_mentor_perf: {
    entityKey: 'scope',
    entityLabel: 'دانشکده',
    hint: 'عملکرد دانشکده‌ها (بازخورد معلمان) را در استان مقایسه کنید',
    filters: ['termId', 'provinceId'],
    metrics: [
      { key: 'responseRate', label: 'نرخ پاسخ', asPercent: true },
      { key: 'avgRating', label: 'میانگین' },
    ],
  },
  province_college_principal_perf: {
    entityKey: 'scope',
    entityLabel: 'دانشکده',
    hint: 'عملکرد دانشکده‌ها (بازخورد مدیران) را در استان مقایسه کنید',
    filters: ['termId', 'provinceId'],
    metrics: [
      { key: 'responseRate', label: 'نرخ پاسخ', asPercent: true },
      { key: 'avgRating', label: 'میانگین' },
    ],
  },
  capacity_distribution: {
    entityKey: 'target',
    entityLabel: 'مبنا',
    hint: 'توزیع ظرفیت را بین مبناها مقایسه کنید',
    filters: ['termId', 'provinceId'],
    metrics: [
      { key: 'total', label: 'کل' },
      { key: 'confirmed', label: 'تأیید' },
      { key: 'remain', label: 'باقی' },
    ],
  },
};

export function getReportCompareSpec(
  reportId: string
): ReportCompareSpec | undefined {
  return REPORT_COMPARE_SPECS[reportId];
}

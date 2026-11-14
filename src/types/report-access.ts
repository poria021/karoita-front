/**
 * ماتریس دسترسی گزارش‌ها — شکل فرانت.
 * مقدار هر کلید گزارش: فهرست شناسهٔ استان‌هایی که آن نقش به گزارش دسترسی دارد.
 * زیرمجوز مقایسه با پسوند `@cmp` روی همان نقش ذخیره می‌شود.
 *
 * توجه: این شکل فقط برای ماکت (mock) نگه داشته شده است. شکل قرارداد Nest
 * (`/api/v1/reports/access*`) پایین‌تر با `ReportAccessRoleRow` و `MyReportAccess` است.
 */
export type ReportAccessRoleId =
  | 'mentor_teacher'
  | 'supervisor_professor'
  | 'school_principal'
  | 'regional_edu_admin'
  | 'faculty_role'
  | 'provincial_university'
  | 'central_organization'
  | 'assistant_admin';

export type ReportSlug =
  | 'learners'
  | 'attendance'
  | 'professor-attendance'
  | 'scores'
  | 'teachers'
  | 'principals'
  | 'professors'
  | 'schools'
  | 'teacher-performance'
  | 'school-performance'
  | 'professor-performance'
  | 'faculties'
  | 'provinces'
  | 'faculty-performance'
  | 'province-performance';

export type ReportAccessSwitchState = 'on' | 'off' | 'mixed' | 'locked';

/** نقش → (اسلاگ گزارش یا اسلاگ@cmp) → استان‌ها */
export type ReportAccessMatrix = Record<
  ReportAccessRoleId,
  Record<string, string[]>
>;

export type ReportAccessDiff = {
  roleId: ReportAccessRoleId;
  key: string;
  add: string[];
  rem: string[];
};

export type ReportAccessSnapshot = {
  matrix: ReportAccessMatrix;
  provinceIds: string[];
  provinceNames: Record<string, string>;
};

/* ------------------------------------------------------------------ */
/* قرارداد Nest: Report Access                                         */
/* ------------------------------------------------------------------ */

/** `active` منو باز است؛ `inactive` اختیاری ولی هنوز فعال‌نشده (نمایش غیرفعال، بدون فراخوانی API گزارش). */
export type ReportAccessStatus = 'active' | 'inactive';

/** `default` همیشه فعال (بدون سوییچ)؛ `optional` فقط همین‌ها قابل تغییرند. */
export type ReportAccessKind = 'default' | 'optional';

/** پاسخ `GET /reports/access/me` به اسلاگ‌های فرانت تبدیل‌شده. گزارشی که نیامده ممنوع است. */
export type MyReportAccess = {
  active: ReportSlug[];
  inactive: ReportSlug[];
  /**
   * زیرمجوز «امکان مقایسه». Nest فعلاً چنین فیلدی ندارد، پس در حالت real همیشه خالی است؛
   * فقط ماکت آن را پر می‌کند.
   */
  compare: ReportSlug[];
};

export type ReportAccessRow = {
  slug: ReportSlug;
  access: ReportAccessKind;
  status: ReportAccessStatus;
  /** وضعیت فعلی سوییچ؛ برای `default` همیشه `true`. */
  enabled: boolean;
};

/** یک نقش از `GET /reports/access`. گزارشی که در `reports` نیست برای این نقش ممنوع است (خط تیره). */
export type ReportAccessRoleRow = {
  roleId: ReportAccessRoleId;
  reports: ReportAccessRow[];
};

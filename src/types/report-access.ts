/**
 * ماتریس دسترسی گزارش‌ها — شکل فرانت.
 * مقدار هر کلید گزارش: فهرست شناسهٔ استان‌هایی که آن نقش به گزارش دسترسی دارد.
 * زیرمجوز مقایسه با پسوند `@cmp` روی همان نقش ذخیره می‌شود.
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

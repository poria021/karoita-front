import type { ReportAccessRoleId, ReportSlug } from '@/types/report-access';

/**
 * نقش فرانت ↔ مقدار `role` در Nest برای API دسترسی گزارش‌ها.
 * هم‌راستا با `nest-auth-role.ts` (mentor ↔ supervisor_professor، teacher ↔ mentor_teacher).
 */
export const REPORT_ACCESS_ROLE_TO_API: Readonly<
  Record<ReportAccessRoleId, string>
> = {
  mentor_teacher: 'teacher',
  supervisor_professor: 'mentor',
  school_principal: 'school_admin',
  regional_edu_admin: 'school_district',
  faculty_role: 'university',
  provincial_university: 'university_province',
  central_organization: 'organization_center',
  assistant_admin: 'admin',
};

const API_TO_REPORT_ACCESS_ROLE = new Map<string, ReportAccessRoleId>(
  (Object.entries(REPORT_ACCESS_ROLE_TO_API) as [ReportAccessRoleId, string][]).map(
    ([front, api]) => [api, front]
  )
);

/** نقش ناشناخته (مثل `superadmin`) → `null`؛ ردیفش در ماتریس نادیده گرفته می‌شود. */
export function reportAccessRoleFromApi(
  value: unknown
): ReportAccessRoleId | null {
  if (typeof value !== 'string') return null;
  return API_TO_REPORT_ACCESS_ROLE.get(value) ?? null;
}

/** اسلاگ فرانت ↔ مقدار `report` در Nest. */
export const REPORT_SLUG_TO_API: Readonly<Record<ReportSlug, string>> = {
  learners: 'learners_list',
  teachers: 'teachers_list',
  principals: 'school_admins_list',
  professors: 'professors_list',
  schools: 'schools_list',
  faculties: 'faculties_list',
  provinces: 'provinces_list',
  attendance: 'learners_attendance',
  'professor-attendance': 'professors_attendance',
  scores: 'learners_grades',
  'teacher-performance': 'teachers_performance',
  'school-performance': 'schools_performance',
  'professor-performance': 'professors_performance',
  'faculty-performance': 'faculties_performance',
  'province-performance': 'provinces_performance',
};

const API_TO_REPORT_SLUG = new Map<string, ReportSlug>(
  (Object.entries(REPORT_SLUG_TO_API) as [ReportSlug, string][]).map(
    ([slug, api]) => [api, slug]
  )
);

/** گزارش ناشناخته → `null` تا UI چیزی از خودش نسازد. */
export function reportSlugFromApi(value: unknown): ReportSlug | null {
  if (typeof value !== 'string') return null;
  return API_TO_REPORT_SLUG.get(value) ?? null;
}

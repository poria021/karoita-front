import type { NestDashboardCountsDto } from '@/types/nest-users';
import type { UserRole } from '@/types/auth';

import type { OrgStructureCounts } from './org-structure-counts';
import type { RoleUserCountsMap } from './role-user-counts';

/** عدد معتبر و نامنفی؛ فیلد نیامده/خراب → ۰. */
function count(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}

/**
 * `GET /api/v1/users/dashboard/counts` → شمار ساختار سازمانی میز کار ادمین.
 * educationalDistricts → مناطق آموزشی، degrees → رشته‌های تحصیلی،
 * universities → دانشکده‌ها / پردیس‌ها.
 */
export function orgCountsFromDashboardCounts(
  dto: NestDashboardCountsDto | null | undefined
): OrgStructureCounts {
  const places = dto?.places;
  return {
    provinces: count(places?.provinces),
    cities: count(places?.cities),
    districts: count(places?.educationalDistricts),
    schools: count(places?.schools),
    majors: count(places?.degrees),
    faculties: count(places?.universities),
  };
}

/**
 * `GET /api/v1/users/dashboard/counts` → شمار کاربران هر نقش (نام نقش بک‌اند → نقش فرانت،
 * همان نگاشت `nest-auth-role`). `mentor` شامل کاربران نقش professor هم هست (بک‌اند جمع می‌زند).
 */
export function roleCountsFromDashboardCounts(
  dto: NestDashboardCountsDto | null | undefined
): RoleUserCountsMap {
  const roles = dto?.roles;
  const map: Partial<Record<UserRole, number>> = {
    student: count(roles?.student),
    skill_learner: count(roles?.trainee),
    supervisor_professor: count(roles?.mentor),
    mentor_teacher: count(roles?.teacher),
    school_principal: count(roles?.schoolAdmin),
    regional_edu_admin: count(roles?.schoolDistrict),
    faculty_role: count(roles?.university),
    provincial_university: count(roles?.universityProvince),
    central_organization: count(roles?.organizationCenter),
  };
  return map;
}

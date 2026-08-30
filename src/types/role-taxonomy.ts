import type { UserRole } from '@/types/auth';

/**
 * طبقه‌بندی نقش‌های FE — فقط برای تصمیم محصول (پنل، تب، Facade).
 * نگاشت Nest در `nest-auth-role.ts` می‌ماند؛ اینجا فقط slug فرانت است.
 */

/** مدیر ارشد و دستیار — پنل `/karvita/admin` و admin-gate. */
export const STAFF_ADMIN_ROLES = [
  'super_admin',
  'assistant_admin',
] as const satisfies readonly UserRole[];

export type StaffAdminRole = (typeof STAFF_ADMIN_ROLES)[number];

/** نقش‌های سازمانی ساخته‌شده از تب «کاربر» در ایجاد حساب. */
export const ORG_MANAGEMENT_ROLES = [
  'central_organization',
  'provincial_university',
  'faculty_role',
  'regional_edu_admin',
] as const satisfies readonly UserRole[];

export type OrgManagementRole = (typeof ORG_MANAGEMENT_ROLES)[number];

/**
 * ستادی که از فرم ایجاد حساب ساخته می‌شود.
 * مدیر ارشد از UI ساخته نمی‌شود؛ فقط دستیار از POST /admin/admins.
 */
export const CREATABLE_STAFF_ADMIN_ROLES = [
  'assistant_admin',
] as const satisfies readonly StaffAdminRole[];

/** حساب‌های قابل ساخت در ماژول ایجاد حساب (سازمانی + دستیار ادمین). */
export const PROVISIONABLE_ACCOUNT_ROLES = [
  ...ORG_MANAGEMENT_ROLES,
  ...CREATABLE_STAFF_ADMIN_ROLES,
] as const satisfies readonly UserRole[];

export type ProvisionableAccountRole =
  (typeof PROVISIONABLE_ACCOUNT_ROLES)[number];

export function isStaffAdminRole(
  role: UserRole | string | null | undefined
): role is StaffAdminRole {
  return role === 'super_admin' || role === 'assistant_admin';
}

/** دانشجو و مهارت‌آموز — کروم داشبورد باریک‌تر از نقش‌های سازمانی/ادمین. */
export const LEARNER_DASHBOARD_ROLES = [
  'student',
  'skill_learner',
] as const satisfies readonly UserRole[];

export type LearnerDashboardRole = (typeof LEARNER_DASHBOARD_ROLES)[number];

export function isLearnerDashboardRole(
  role: UserRole | string | null | undefined
): role is LearnerDashboardRole {
  return role === 'student' || role === 'skill_learner';
}

export function isOrgManagementRole(
  role: UserRole | string | null | undefined
): role is OrgManagementRole {
  return (ORG_MANAGEMENT_ROLES as readonly string[]).includes(role ?? '');
}

export function isCreatableStaffAdminRole(
  role: UserRole | string | null | undefined
): role is (typeof CREATABLE_STAFF_ADMIN_ROLES)[number] {
  return role === 'assistant_admin';
}

export function isProvisionableAccountRole(
  role: string
): role is ProvisionableAccountRole {
  return (PROVISIONABLE_ACCOUNT_ROLES as readonly string[]).includes(role);
}

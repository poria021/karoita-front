import type { User, UserRole } from '@/types/auth';

/** نقش‌هایی که مدیر ارشد می‌تواند به‌صورت دستی بسازد. */
export const ORG_ACCOUNT_ROLES = [
  'central_organization',
  'provincial_university',
  'faculty_role',
  'regional_edu_admin',
  'assistant_admin',
  'super_admin',
] as const;

export type OrgAccountRole = (typeof ORG_ACCOUNT_ROLES)[number];

export function isOrgAccountRole(role: string): role is OrgAccountRole {
  return (ORG_ACCOUNT_ROLES as readonly string[]).includes(role);
}

/**
 * DTO ایجاد حساب سازمانی — شکل Nest-flat.
 * ارقام شناسه‌ها (موبایل) همیشه ASCII انگلیسی‌اند.
 */
export type CreateOrganizationalUserInput = {
  firstName: string;
  lastName: string;
  mobile: string;
  password: string;
  role: OrgAccountRole;
  province?: string;
  city?: string;
  college?: string;
  district?: string;
};

export type CreateOrganizationalUserResult = {
  user: User;
};

export type MobileAvailabilityResult = {
  available: boolean;
};

export type OrgAccountRoleOption = {
  value: OrgAccountRole;
  label: string;
};

/** زیرمجموعهٔ UserRole که در این ماژول ساخته می‌شود. */
export type CreatedOrgUserRole = Extract<UserRole, OrgAccountRole>;

import type { User, UserRole } from '@/types/auth';
import {
  PROVISIONABLE_ACCOUNT_ROLES,
  type ProvisionableAccountRole,
} from '@/types/role-taxonomy';

/** نقش‌هایی که مدیر ارشد می‌تواند به‌صورت دستی بسازد. */
export const ORG_ACCOUNT_ROLES = PROVISIONABLE_ACCOUNT_ROLES;

export type OrgAccountRole = ProvisionableAccountRole;

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

/**
 * ردیف GET /api/v1/admin/admins — شکل فرانت (fname/lname/phone Nest جدا می‌ماند).
 */
export type StaffAdminAccount = {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  role: UserRole;
  statusName: string;
  createdAt: string;
};

export type StaffAdminsPage = {
  data: StaffAdminAccount[];
  hasNextPage: boolean;
};

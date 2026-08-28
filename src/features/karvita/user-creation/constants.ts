import type {
  OrgAccountRole,
  OrgAccountRoleOption,
} from '@/types/admin-user-creation';
import { ORG_ACCOUNT_ROLES } from '@/types/admin-user-creation';

export const ORG_ACCOUNT_KIND_TABS = [
  { value: 'user', label: 'کاربر' },
  { value: 'admin', label: 'ادمین' },
] as const;

export type OrgAccountKind = (typeof ORG_ACCOUNT_KIND_TABS)[number]['value'];

export const ORG_ACCOUNT_ROLE_LABELS: Record<OrgAccountRole, string> = {
  central_organization: 'سازمان مرکزی',
  provincial_university: 'دانشگاه استانی',
  faculty_role: 'مدیر دانشکده',
  regional_edu_admin: 'آموزش و پرورش منطقه',
  assistant_admin: 'دستیار ادمین',
  super_admin: 'ادمین کل',
};

export const ORG_ACCOUNT_ROLE_OPTIONS: OrgAccountRoleOption[] =
  ORG_ACCOUNT_ROLES.map((value) => ({
    value,
    label: ORG_ACCOUNT_ROLE_LABELS[value],
  }));

/** حساب‌های ستادی: ادمین کل و دستیار ادمین. */
const USER_KIND_ROLES = [
  'super_admin',
  'assistant_admin',
] as const satisfies readonly OrgAccountRole[];

export function getOrgAccountRoleOptionsForKind(
  kind: OrgAccountKind
): OrgAccountRoleOption[] {
  if (kind === 'user') {
    return USER_KIND_ROLES.map((value) => ({
      value,
      label: ORG_ACCOUNT_ROLE_LABELS[value],
    }));
  }

  return ORG_ACCOUNT_ROLE_OPTIONS.filter(
    (option) =>
      !(USER_KIND_ROLES as readonly OrgAccountRole[]).includes(option.value)
  );
}

export function isOrgAccountRoleAllowedForKind(
  role: string,
  kind: OrgAccountKind
): boolean {
  return getOrgAccountRoleOptionsForKind(kind).some(
    (option) => option.value === role
  );
}

export const ADMIN_USER_CREATION_DEFAULTS = {
  firstName: '',
  lastName: '',
  mobile: '',
  password: '',
  role: '' as const,
  province: '',
  city: '',
  college: '',
  district: '',
};

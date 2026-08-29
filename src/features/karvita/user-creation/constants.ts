import type {
  OrgAccountRole,
  OrgAccountRoleOption,
} from '@/types/admin-user-creation';
import {
  CREATABLE_STAFF_ADMIN_ROLES,
  ORG_MANAGEMENT_ROLES,
} from '@/types/role-taxonomy';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

export const ORG_ACCOUNT_KIND_TABS = [
  { value: 'user', label: 'کاربر' },
  { value: 'admin', label: 'ادمین' },
] as const;

export type OrgAccountKind = (typeof ORG_ACCOUNT_KIND_TABS)[number]['value'];

function roleOption(value: OrgAccountRole): OrgAccountRoleOption {
  return {
    value,
    label: getRoleStrategy(value).label,
  };
}

export function getOrgAccountRoleOptionsForKind(
  kind: OrgAccountKind
): OrgAccountRoleOption[] {
  if (kind === 'admin') {
    return CREATABLE_STAFF_ADMIN_ROLES.map(roleOption);
  }

  return ORG_MANAGEMENT_ROLES.map(roleOption);
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

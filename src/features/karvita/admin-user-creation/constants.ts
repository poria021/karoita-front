import type {
  OrgAccountRole,
  OrgAccountRoleOption,
} from '@/types/admin-user-creation';
import { ORG_ACCOUNT_ROLES } from '@/types/admin-user-creation';

export const ORG_ACCOUNT_ROLE_LABELS: Record<OrgAccountRole, string> = {
  central_organization: 'سازمان مرکزی',
  provincial_university: 'دانشگاه استانی',
  faculty_role: 'مدیر دانشکده',
  regional_edu_admin: 'آموزش و پرورش منطقه',
  assistant_admin: 'دستیار مدیر',
};

export const ORG_ACCOUNT_ROLE_OPTIONS: OrgAccountRoleOption[] =
  ORG_ACCOUNT_ROLES.map((value) => ({
    value,
    label: ORG_ACCOUNT_ROLE_LABELS[value],
  }));

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

export const ORG_OPTIONS_FETCH_LIMIT = 200;

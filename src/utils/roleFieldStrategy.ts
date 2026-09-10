import type { UserRole } from '@/types/auth';

export type OrganizationField =
  | 'province'
  | 'city'
  | 'college'
  | 'district'
  | 'school'
  | 'major';

export type IdentifierField = 'studentId' | 'skillCode' | 'personalCode';

export type RoleFieldStrategy = {
  organizationFields: OrganizationField[];
  identifierFields: IdentifierField[];
};

export const ROLE_FIELD_STRATEGY: Record<UserRole, RoleFieldStrategy> = {
  student: {
    organizationFields: ['province', 'college', 'major'],
    identifierFields: ['studentId'],
  },
  skill_learner: {
    organizationFields: ['province', 'college', 'major'],
    identifierFields: ['skillCode'],
  },
  supervisor_professor: {
    organizationFields: ['province', 'college', 'major'],
    identifierFields: ['personalCode'],
  },
  mentor_teacher: {
    organizationFields: ['province', 'city', 'district', 'school'],
    identifierFields: ['personalCode'],
  },
  school_principal: {
    organizationFields: ['province', 'city', 'district', 'school'],
    identifierFields: ['personalCode'],
  },
  regional_edu_admin: {
    organizationFields: ['province', 'city', 'district'],
    identifierFields: ['personalCode'],
  },
  faculty_role: {
    organizationFields: ['province', 'college'],
    identifierFields: [],
  },
  provincial_university: {
    organizationFields: ['province'],
    identifierFields: [],
  },
  assistant_admin: { organizationFields: [], identifierFields: [] },
  central_organization: { organizationFields: [], identifierFields: [] },
  super_admin: { organizationFields: [], identifierFields: [] },
};

export const ORGANIZATION_LABELS: Record<OrganizationField, string> = {
  province: 'استان',
  city: 'شهر تابعه',
  college: 'دانشکده / پردیس / دانشگاه',
  district: 'منطقه آموزشی',
  school: 'مدرسه محل خدمت',
  major: 'رشته تحصیلی',
};

export const IDENTIFIER_META: Record<
  IdentifierField,
  { label: string; placeholder: string }
> = {
  studentId: { label: 'شماره دانشجویی', placeholder: 'مثال: ۱۴۰۲۱۰۳۴۵' },
  skillCode: { label: 'کد مهارت‌آموزی', placeholder: 'مثال: ۹۹۴۱۲' },
  personalCode: { label: 'کد پرسنلی', placeholder: 'مثال: ۱۰۰۰۲۳۴۵' },
};

export function getIdentifierMeta(
  role: UserRole,
  field: IdentifierField
): { label: string; placeholder: string } {
  if (field === 'personalCode' && role === 'supervisor_professor') {
    return {
      label: 'کد استادی',
      placeholder: IDENTIFIER_META.personalCode.placeholder,
    };
  }
  return IDENTIFIER_META[field];
}

export function isOptionalOrganizationField(
  role: UserRole,
  field: OrganizationField
): boolean {
  return (
    (field === 'city' || field === 'district' || field === 'school') &&
    (role === 'mentor_teacher' || role === 'school_principal')
  );
}

/** الزام فیلد فرم ایجاد حساب سازمانی از `ROLE_FIELD_STRATEGY`. */
export function orgAccountRequiresField(
  role: UserRole | '',
  field: OrganizationField
): boolean {
  if (!role) return false;
  return ROLE_FIELD_STRATEGY[role].organizationFields.includes(field);
}

export function orgAccountRequiresProvince(role: UserRole | ''): boolean {
  return orgAccountRequiresField(role, 'province');
}

export function orgAccountRequiresCollege(role: UserRole | ''): boolean {
  return orgAccountRequiresField(role, 'college');
}

export function orgAccountRequiresCity(role: UserRole | ''): boolean {
  return orgAccountRequiresField(role, 'city');
}

export function orgAccountRequiresDistrict(role: UserRole | ''): boolean {
  return orgAccountRequiresField(role, 'district');
}

export type RoleProfileDisplayField = {
  key: OrganizationField | IdentifierField;
  label: string;
  numeric?: boolean;
};

export function getRoleProfileDisplayFields(
  role: UserRole
): RoleProfileDisplayField[] {
  const strategy = ROLE_FIELD_STRATEGY[role];
  return [
    ...strategy.organizationFields.map((key) => ({
      key,
      label: ORGANIZATION_LABELS[key],
    })),
    ...strategy.identifierFields.map((key) => ({
      key,
      label: getIdentifierMeta(role, key).label,
      numeric: true as const,
    })),
  ];
}

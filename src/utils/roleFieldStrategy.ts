import type { UserRole } from '@/types/auth';

/** Org selects shared by profile + admin review UIs. */
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

/**
 * Single source of truth: which profile fields each role collects.
 * Used by profile forms and onboarding-approvals detail panels.
 */
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

/** Role-aware identifier copy (e.g. professor panel uses «کد استادی»). */
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

/** City is optional only for mentor/principal; required for regional admin. */
export function isOptionalOrganizationField(
  role: UserRole,
  field: OrganizationField
): boolean {
  return (
    field === 'city' &&
    (role === 'mentor_teacher' || role === 'school_principal')
  );
}

export type RoleProfileDisplayField = {
  key: OrganizationField | IdentifierField;
  label: string;
  numeric?: boolean;
};

/** Ordered profile fields for a role — org first, then identifiers. */
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

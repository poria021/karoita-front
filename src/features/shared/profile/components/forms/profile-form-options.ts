import type { User, UserRole } from '@/types/auth';
import type { OrganizationField } from '@/utils/roleFieldStrategy';
import {
  IDENTIFIER_META,
  getIdentifierMeta,
  isOptionalOrganizationField,
  ORGANIZATION_LABELS,
  ROLE_FIELD_STRATEGY,
} from '@/utils/roleFieldStrategy';

import { listOrganizationLabels } from '../../data/organization-catalog';
import type { ProfileSchema } from '../../schemas/profile.schema';

export type { OrganizationField, IdentifierField } from '@/utils/roleFieldStrategy';
export {
  IDENTIFIER_META,
  getIdentifierMeta,
  isOptionalOrganizationField,
  ORGANIZATION_LABELS,
  ROLE_FIELD_STRATEGY,
};

export const DEPENDENCIES: Partial<
  Record<OrganizationField, OrganizationField[]>
> = {
  province: ['city', 'college', 'district', 'school'],
  district: ['school'],
};

export function getOrganizationOptions(
  field: OrganizationField,
  province: string,
  district: string
): string[] {
  return listOrganizationLabels(field, province, district);
}

type DefaultValuesFactory = (user: User) => ProfileSchema;

const PROFILE_DEFAULTS: Record<UserRole, DefaultValuesFactory> = {
  student: (user) => ({
    role: 'student', firstName: user.firstName, lastName: user.lastName,
    province: user.province ?? '', college: user.college ?? '',
    major: user.major ?? '', studentId: user.studentId ?? '',
  }),
  skill_learner: (user) => ({
    role: 'skill_learner', firstName: user.firstName, lastName: user.lastName,
    province: user.province ?? '', college: user.college ?? '',
    major: user.major ?? '', skillCode: user.skillCode ?? '',
  }),
  supervisor_professor: (user) => ({
    role: 'supervisor_professor', firstName: user.firstName, lastName: user.lastName,
    province: user.province ?? '', college: user.college ?? '',
    major: user.major ?? '', personalCode: user.personalCode ?? '',
  }),
  mentor_teacher: (user) => ({
    role: 'mentor_teacher', firstName: user.firstName, lastName: user.lastName,
    province: user.province ?? '', city: user.city ?? '',
    district: user.district ?? '', school: user.school ?? '',
    personalCode: user.personalCode ?? '',
  }),
  school_principal: (user) => ({
    role: 'school_principal', firstName: user.firstName, lastName: user.lastName,
    province: user.province ?? '', city: user.city ?? '',
    district: user.district ?? '', school: user.school ?? '',
    personalCode: user.personalCode ?? '',
  }),
  regional_edu_admin: (user) => ({
    role: 'regional_edu_admin', firstName: user.firstName, lastName: user.lastName,
    province: user.province ?? '', city: user.city ?? '',
    district: user.district ?? '', personalCode: user.personalCode ?? '',
  }),
  faculty_role: (user) => ({
    role: 'faculty_role', firstName: user.firstName, lastName: user.lastName,
    province: user.province ?? '', college: user.college ?? '',
  }),
  provincial_university: (user) => ({
    role: 'provincial_university', firstName: user.firstName,
    lastName: user.lastName, province: user.province ?? '',
  }),
  assistant_admin: (user) => ({
    role: 'assistant_admin', firstName: user.firstName,
    lastName: user.lastName, province: user.province,
  }),
  central_organization: (user) => ({
    role: 'central_organization', firstName: user.firstName,
    lastName: user.lastName, province: user.province,
  }),
  super_admin: (user) => ({
    role: 'super_admin', firstName: user.firstName,
    lastName: user.lastName, province: user.province,
  }),
};

export function getProfileDefaultValues(user: User): ProfileSchema {
  return PROFILE_DEFAULTS[user.role](user);
}

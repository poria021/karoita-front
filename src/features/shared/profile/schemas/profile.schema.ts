import { z } from 'zod';

import type { UserRole } from '@/types/auth';
import { persianToEnglishDigits } from '@/utils/persianDigits';

/**
 * Polymorphic profile onboarding schemas (Phase 1).
 *
 * Field requirements mirror the identity tab of `original-karvita.html`
 * and are expressed as a `z.discriminatedUnion('role', ...)`.
 *
 * Numeric identifiers go through `.transform().pipe()` so Persian/Arabic
 * digits are normalized before length/digit checks (rule 10).
 */

/** Non-empty trimmed text field with a polite Persian required-message. */
function requiredTextField(requiredMessage: string) {
  return z
    .string(requiredMessage)
    .trim()
    .min(1, requiredMessage);
}

/**
 * Strictly numeric identifier (student ID / skill code / personal code).
 * Accepts Persian/Arabic digits, normalizes to English, then enforces
 * "at least 4 digits, digits only".
 */
function requiredNumericIdField(options: {
  requiredMessage: string;
  invalidMessage: string;
}) {
  return z
    .string(options.requiredMessage)
    .transform((value) => persianToEnglishDigits(value).trim())
    .pipe(
      z
        .string()
        .min(1, options.requiredMessage)
        .regex(/^\d+$/, options.invalidMessage)
        .min(4, options.invalidMessage)
    );
}

const firstNameField = requiredTextField('لطفاً نام خود را وارد کنید.');
const lastNameField = requiredTextField('لطفاً نام خانوادگی خود را وارد کنید.');
const provinceField = requiredTextField(
  'لطفاً استان محل سکونت یا خدمت خود را انتخاب کنید.'
);
const collegeField = requiredTextField(
  'لطفاً دانشکده / پردیس خود را انتخاب کنید.'
);
const majorField = requiredTextField('لطفاً رشته تحصیلی خود را انتخاب کنید.');
const districtField = requiredTextField(
  'لطفاً منطقه آموزشی خود را انتخاب کنید.'
);
const schoolField = requiredTextField(
  'لطفاً مدرسه محل خدمت خود را انتخاب کنید.'
);
const cityField = requiredTextField('لطفاً شهر تابعه خود را انتخاب کنید.');

/** Optional city — empty string from the form is accepted as unset. */
const optionalCityField = z.string().trim().optional();

const studentIdField = requiredNumericIdField({
  requiredMessage: 'شماره دانشجویی الزامی است.',
  invalidMessage: 'شماره دانشجویی باید حداقل ۴ رقم عددی باشد.',
});

const skillCodeField = requiredNumericIdField({
  requiredMessage: 'کد مهارت‌آموزی الزامی است.',
  invalidMessage: 'کد مهارت‌آموزی باید حداقل ۴ رقم عددی باشد.',
});

const personalCodeField = requiredNumericIdField({
  requiredMessage: 'کد پرسنلی الزامی است.',
  invalidMessage: 'کد پرسنلی باید حداقل ۴ رقم عددی باشد.',
});

/** Shared personal-name fields present on every profile form. */
const identityNameSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
});

/**
 * Roles that do not require province:
 * `super_admin`, `central_organization`, `assistant_admin`.
 * Province stays optional so the form can still bind the field safely.
 */
const adminOnlyProfileSchema = identityNameSchema.extend({
  role: z.enum(['super_admin', 'central_organization', 'assistant_admin']),
  province: z.string().trim().optional(),
});

/** `student` — province + college + major + studentId */
export const studentProfileSchema = identityNameSchema.extend({
  role: z.literal('student'),
  province: provinceField,
  college: collegeField,
  major: majorField,
  studentId: studentIdField,
});

/** `skill_learner` — province + college + major + skillCode */
export const skillLearnerProfileSchema = identityNameSchema.extend({
  role: z.literal('skill_learner'),
  province: provinceField,
  college: collegeField,
  major: majorField,
  skillCode: skillCodeField,
});

/** `supervisor_professor` — province + college + major + personalCode */
export const supervisorProfessorProfileSchema = identityNameSchema.extend({
  role: z.literal('supervisor_professor'),
  province: provinceField,
  college: collegeField,
  major: majorField,
  personalCode: personalCodeField,
});

/** `mentor_teacher` — province + district + school + personalCode (+ optional city) */
export const mentorTeacherProfileSchema = identityNameSchema.extend({
  role: z.literal('mentor_teacher'),
  province: provinceField,
  district: districtField,
  school: schoolField,
  personalCode: personalCodeField,
  city: optionalCityField,
});

/** `school_principal` — province + district + school + personalCode (+ optional city) */
export const schoolPrincipalProfileSchema = identityNameSchema.extend({
  role: z.literal('school_principal'),
  province: provinceField,
  district: districtField,
  school: schoolField,
  personalCode: personalCodeField,
  city: optionalCityField,
});

/** `regional_edu_admin` — province + district + city + personalCode */
export const regionalEduAdminProfileSchema = identityNameSchema.extend({
  role: z.literal('regional_edu_admin'),
  province: provinceField,
  district: districtField,
  city: cityField,
  personalCode: personalCodeField,
});

/** `faculty_role` — province + college */
export const facultyRoleProfileSchema = identityNameSchema.extend({
  role: z.literal('faculty_role'),
  province: provinceField,
  college: collegeField,
});

/** `provincial_university` — province only (beyond name fields) */
export const provincialUniversityProfileSchema = identityNameSchema.extend({
  role: z.literal('provincial_university'),
  province: provinceField,
});

/**
 * Unified, role-conditional profile schema.
 * Discriminates on `role` so TypeScript narrows required fields per branch.
 */
export const profileSchema = z.discriminatedUnion('role', [
  studentProfileSchema,
  skillLearnerProfileSchema,
  supervisorProfessorProfileSchema,
  mentorTeacherProfileSchema,
  schoolPrincipalProfileSchema,
  regionalEduAdminProfileSchema,
  facultyRoleProfileSchema,
  provincialUniversityProfileSchema,
  adminOnlyProfileSchema,
]);

export type ProfileSchema = z.infer<typeof profileSchema>;

/**
 * Builds a role-locked schema for forms that already know the active user's
 * role from `useUserStore` (so the form does not need a free-form `role` input).
 */
export function createProfileSchema(role: UserRole) {
  switch (role) {
    case 'student':
      return studentProfileSchema;
    case 'skill_learner':
      return skillLearnerProfileSchema;
    case 'supervisor_professor':
      return supervisorProfessorProfileSchema;
    case 'mentor_teacher':
      return mentorTeacherProfileSchema;
    case 'school_principal':
      return schoolPrincipalProfileSchema;
    case 'regional_edu_admin':
      return regionalEduAdminProfileSchema;
    case 'faculty_role':
      return facultyRoleProfileSchema;
    case 'provincial_university':
      return provincialUniversityProfileSchema;
    case 'super_admin':
    case 'central_organization':
    case 'assistant_admin':
      return adminOnlyProfileSchema.safeExtend({
        role: z.literal(role),
      });
  }
}

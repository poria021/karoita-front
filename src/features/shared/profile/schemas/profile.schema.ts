import { z } from 'zod';

import type { UserRole } from '@/types/auth';
import { persianToEnglishDigits } from '@/utils/persianDigits';

/**
 * Profile onboarding Zod schemas (rule 10).
 *
 * Role-conditional fields mirror the identity tab of `original-karvita.html`.
 * Numeric identifiers are normalized via `.transform().pipe()` (same pattern
 * as `auth.schema.ts`) so Persian/Arabic digits never break `zodResolver`.
 */

/** Non-empty trimmed Farsi text field with a polite required-message. */
function requiredTextField(requiredMessage: string) {
  return z
    .string(requiredMessage)
    .trim()
    .min(1, requiredMessage);
}

/**
 * Strictly numeric identifier (student ID / skill code / personal code).
 * Accepts Persian/Arabic digits, normalizes to English, then enforces
 * "at least 4 digits, digits only" — matching the mockup helper copy.
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
const provinceField = requiredTextField('لطفاً استان محل سکونت یا خدمت خود را انتخاب کنید.');
const collegeField = requiredTextField('لطفاً دانشکده / پردیس خود را انتخاب کنید.');
const majorField = requiredTextField('لطفاً رشته تحصیلی خود را انتخاب کنید.');

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

/** Shared identity fields required for every role's profile form. */
const profileBaseSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
  province: provinceField,
});

const studentProfileSchema = profileBaseSchema.extend({
  role: z.literal('student'),
  college: collegeField,
  major: majorField,
  studentId: studentIdField,
});

const skillLearnerProfileSchema = profileBaseSchema.extend({
  role: z.literal('skill_learner'),
  college: collegeField,
  major: majorField,
  skillCode: skillCodeField,
});

const personalCodeProfileSchema = profileBaseSchema.extend({
  role: z.enum([
    'supervisor_professor',
    'mentor_teacher',
    'school_principal',
    'regional_edu_admin',
  ]),
  personalCode: personalCodeField,
});

/**
 * Roles with no extra identity fields beyond the shared base
 * (`super_admin` and the remaining organizational roles).
 */
const baseOnlyProfileSchema = profileBaseSchema.extend({
  role: z.enum([
    'super_admin',
    'faculty_role',
    'provincial_university',
    'assistant_admin',
    'central_organization',
  ]),
});

/**
 * Unified, role-conditional profile schema.
 *
 * Discriminates on `role` so TypeScript narrows the required fields per
 * branch (rule 10: infer form types from Zod with `z.infer`).
 */
export const profileSchema = z.discriminatedUnion('role', [
  studentProfileSchema,
  skillLearnerProfileSchema,
  personalCodeProfileSchema,
  baseOnlyProfileSchema,
]);

export type ProfileSchema = z.infer<typeof profileSchema>;

/**
 * Builds a role-locked schema for forms that already know the active user's
 * role from `useUserStore` (so the form does not need a free-form `role` input).
 *
 * Picks the matching branch of `profileSchema` and narrows `role` to a literal.
 */
export function createProfileSchema(role: UserRole) {
  switch (role) {
    case 'student':
      return studentProfileSchema;
    case 'skill_learner':
      return skillLearnerProfileSchema;
    case 'supervisor_professor':
    case 'mentor_teacher':
    case 'school_principal':
    case 'regional_edu_admin':
      return personalCodeProfileSchema.safeExtend({
        role: z.literal(role),
      });
    case 'super_admin':
    case 'faculty_role':
    case 'provincial_university':
    case 'assistant_admin':
    case 'central_organization':
      return baseOnlyProfileSchema.safeExtend({
        role: z.literal(role),
      });
  }
}

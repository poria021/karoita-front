import { z } from 'zod';

import type { UserRole } from '@/types/auth';
import { persianToEnglishDigits } from '@/utils/persianDigits';


function requiredTextField(requiredMessage: string) {
  return z
    .string(requiredMessage)
    .trim()
    .min(1, requiredMessage);
}

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

const professorCodeField = requiredNumericIdField({
  requiredMessage: 'کد استادی الزامی است.',
  invalidMessage: 'کد استادی باید حداقل ۴ رقم عددی باشد.',
});

const identityNameSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
});

const adminOnlyProfileSchema = identityNameSchema.extend({
  role: z.enum(['super_admin', 'central_organization', 'assistant_admin']),
  province: z.string().trim().optional(),
});

export const studentProfileSchema = identityNameSchema.extend({
  role: z.literal('student'),
  province: provinceField,
  college: collegeField,
  major: majorField,
  studentId: studentIdField,
});

export const skillLearnerProfileSchema = identityNameSchema.extend({
  role: z.literal('skill_learner'),
  province: provinceField,
  college: collegeField,
  major: majorField,
  skillCode: skillCodeField,
});

export const supervisorProfessorProfileSchema = identityNameSchema.extend({
  role: z.literal('supervisor_professor'),
  province: provinceField,
  college: collegeField,
  major: majorField,
  personalCode: professorCodeField,
});

export const mentorTeacherProfileSchema = identityNameSchema.extend({
  role: z.literal('mentor_teacher'),
  province: provinceField,
  district: districtField,
  school: schoolField,
  personalCode: personalCodeField,
  city: optionalCityField,
});

export const schoolPrincipalProfileSchema = identityNameSchema.extend({
  role: z.literal('school_principal'),
  province: provinceField,
  district: districtField,
  school: schoolField,
  personalCode: personalCodeField,
  city: optionalCityField,
});

export const regionalEduAdminProfileSchema = identityNameSchema.extend({
  role: z.literal('regional_edu_admin'),
  province: provinceField,
  district: districtField,
  city: cityField,
  personalCode: personalCodeField,
});

export const facultyRoleProfileSchema = identityNameSchema.extend({
  role: z.literal('faculty_role'),
  province: provinceField,
  college: collegeField,
});

export const provincialUniversityProfileSchema = identityNameSchema.extend({
  role: z.literal('provincial_university'),
  province: provinceField,
});

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

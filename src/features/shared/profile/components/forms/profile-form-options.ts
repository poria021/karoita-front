import type { User, UserRole } from '@/types/auth';

import type { ProfileSchema } from '../../schemas/profile.schema';

export type OrganizationField =
  | 'province'
  | 'city'
  | 'college'
  | 'district'
  | 'school'
  | 'major';
export type IdentifierField = 'studentId' | 'skillCode' | 'personalCode';

interface RoleFieldStrategy {
  organizationFields: OrganizationField[];
  identifierFields: IdentifierField[];
}

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

interface OrganizationBranch {
  province: string;
  cities: string[];
  colleges: string[];
  districts: Array<{ name: string; schools: string[] }>;
}

const ORGANIZATION: OrganizationBranch[] = [
  {
    province: 'تهران',
    cities: ['تهران', 'ری', 'شمیرانات'],
    colleges: ['پردیس شهید باهنر تهران', 'دانشگاه فرهنگیان نسیبه تهران'],
    districts: [
      { name: 'ناحیه ۱ تهران', schools: ['دبیرستان ماندگار البرز', 'مدرسه فرهنگ'] },
      { name: 'ناحیه ۲ تهران', schools: ['دبیرستان شهید بهشتی', 'هنرستان آزادی'] },
    ],
  },
  {
    province: 'اصفهان',
    cities: ['اصفهان', 'کاشان', 'نجف‌آباد'],
    colleges: ['پردیس شهید باهنر اصفهان', 'مرکز آموزش عالی کاشان'],
    districts: [
      { name: 'ناحیه ۱ اصفهان', schools: ['دبیرستان سعدی', 'هنرستان امیرکبیر'] },
      { name: 'ناحیه ۲ اصفهان', schools: ['دبیرستان صارمیه', 'مدرسه ادب'] },
    ],
  },
  {
    province: 'فارس',
    cities: ['شیراز', 'مرودشت', 'جهرم'],
    colleges: ['پردیس شهید رجایی فارس', 'مرکز آموزش عالی شیراز'],
    districts: [
      { name: 'ناحیه ۱ شیراز', schools: ['دبیرستان نمازی', 'هنرستان دستغیب'] },
      { name: 'ناحیه ۲ شیراز', schools: ['دبیرستان توحید', 'مدرسه ملاصدرا'] },
    ],
  },
];

const MAJORS = [
  'آموزش ابتدایی',
  'دبیری زبان و ادبیات فارسی',
  'دبیری ریاضی',
  'دبیری علوم تجربی',
  'آموزش فنی و حرفه‌ای',
];

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

export const DEPENDENCIES: Partial<
  Record<OrganizationField, OrganizationField[]>
> = {
  province: ['city', 'college', 'district', 'school'],
  district: ['school'],
};

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

export function getOrganizationOptions(
  field: OrganizationField,
  province: string,
  district: string
): string[] {
  if (field === 'province') return ORGANIZATION.map((item) => item.province);
  if (field === 'major') return MAJORS;

  const branch = ORGANIZATION.find((item) => item.province === province);
  if (!branch) return [];
  if (field === 'city') return branch.cities;
  if (field === 'college') return branch.colleges;
  if (field === 'district') return branch.districts.map((item) => item.name);
  return branch.districts.find((item) => item.name === district)?.schools ?? [];
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

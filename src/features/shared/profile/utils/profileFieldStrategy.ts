import type { UserRole } from '@/types/auth';

export type ProfileFieldKey =
  | 'college'
  | 'major'
  | 'studentId'
  | 'skillCode'
  | 'personalCode';

export interface ProfileFieldConfig {
  key: ProfileFieldKey;
  label: string;
  placeholder: string;
  required: boolean;
  inputMode?: 'text' | 'numeric';
}

const COLLEGE_FIELD: ProfileFieldConfig = {
  key: 'college',
  label: 'دانشکده / پردیس',
  placeholder: 'مثال: پردیس البرز',
  required: true,
};

const MAJOR_FIELD: ProfileFieldConfig = {
  key: 'major',
  label: 'رشته تحصیلی / مهارتی',
  placeholder: 'مثال: آموزش ابتدایی',
  required: true,
};

const STUDENT_ID_FIELD: ProfileFieldConfig = {
  key: 'studentId',
  label: 'شماره دانشجویی',
  placeholder: '۱۴۰۲۱۰۳۴۵',
  required: true,
  inputMode: 'numeric',
};

const SKILL_CODE_FIELD: ProfileFieldConfig = {
  key: 'skillCode',
  label: 'کد مهارت‌آموزی',
  placeholder: '۹۹۴۱۲',
  required: true,
  inputMode: 'numeric',
};

const PERSONAL_CODE_FIELD: ProfileFieldConfig = {
  key: 'personalCode',
  label: 'کد پرسنلی',
  placeholder: '۱۲۳۴۵۶۷۸',
  required: true,
  inputMode: 'numeric',
};

const PROFESSOR_CODE_FIELD: ProfileFieldConfig = {
  ...PERSONAL_CODE_FIELD,
  label: 'کد استادی',
};

const PROFILE_FIELDS_BY_ROLE: Record<UserRole, ProfileFieldConfig[]> = {
  student: [STUDENT_ID_FIELD, { ...MAJOR_FIELD, label: 'رشته تحصیلی' }, COLLEGE_FIELD],
  skill_learner: [
    SKILL_CODE_FIELD,
    { ...MAJOR_FIELD, label: 'رشته مهارتی', placeholder: 'مثال: آموزش فنی و حرفه‌ای' },
    COLLEGE_FIELD,
  ],
  supervisor_professor: [PROFESSOR_CODE_FIELD],
  mentor_teacher: [PERSONAL_CODE_FIELD],
  school_principal: [PERSONAL_CODE_FIELD],
  regional_edu_admin: [PERSONAL_CODE_FIELD],
  faculty_role: [],
  provincial_university: [],
  assistant_admin: [],
  central_organization: [],
  super_admin: [],
};

export function getProfileFieldsForRole(role: UserRole): ProfileFieldConfig[] {
  return PROFILE_FIELDS_BY_ROLE[role];
}

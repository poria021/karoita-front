import type { User, UserRole } from '@/types/auth';

export type ReportAccessKey =
  | 'mentor-reports'
  | 'principal-reports'
  | 'regional-reports'
  | 'faculty-reports'
  | 'provincial-reports'
  | 'central-reports'
  | 'admin-reports';

export type ReportAccessToggle = {
  role: UserRole;
  province: string;
  reportKey: ReportAccessKey;
  canView: boolean;
  canCompare: boolean;
};

export const REPORT_ACCESS_PROVINCES = [
  'کل کشور',
  'تهران',
  'اصفهان',
  'خراسان رضوی',
  'فارس',
  'آذربایجان غربی',
] as const;

export const REPORT_ACCESS_ROLES: ReadonlyArray<UserRole> = [
  'mentor_teacher',
  'supervisor_professor',
  'school_principal',
  'regional_edu_admin',
  'faculty_role',
  'provincial_university',
  'central_organization',
  'assistant_admin',
  'super_admin',
];

const roleToReportKey: Record<UserRole, ReportAccessKey> = {
  student: 'mentor-reports',
  skill_learner: 'mentor-reports',
  mentor_teacher: 'mentor-reports',
  supervisor_professor: 'mentor-reports',
  school_principal: 'principal-reports',
  regional_edu_admin: 'regional-reports',
  faculty_role: 'faculty-reports',
  provincial_university: 'provincial-reports',
  assistant_admin: 'admin-reports',
  central_organization: 'central-reports',
  super_admin: 'admin-reports',
};

const defaultAccessRules: ReadonlyArray<ReportAccessToggle> = REPORT_ACCESS_ROLES.flatMap(
  (role) =>
    REPORT_ACCESS_PROVINCES.map((province) => ({
      role,
      province,
      reportKey: roleToReportKey[role],
      canView: true,
      canCompare: true,
    }))
);

export function resolveReportAccessKey(role: UserRole): ReportAccessKey {
  return roleToReportKey[role] ?? 'mentor-reports';
}

export function listDefaultReportAccessRules(): ReportAccessToggle[] {
  return [...defaultAccessRules];
}

export function getUserAccessibleProvince(user: User | null | undefined): string {
  const provinces = user?.province && user.province.length > 0 ? user.province : ['کل کشور'];
  return provinces[0] ?? 'کل کشور';
}

export function hasReportAccessForUser(
  user: User | null | undefined,
  role: UserRole,
  reportKey?: ReportAccessKey
): boolean {
  if (!user) return false;

  const activeRole = role ?? user.role;
  const resolvedKey = reportKey ?? resolveReportAccessKey(activeRole);
  const province = getUserAccessibleProvince(user);

  const rules = listDefaultReportAccessRules().filter(
    (rule) => rule.role === activeRole && rule.reportKey === resolvedKey
  );

  const provinceRule = rules.find((rule) => rule.province === province)
    ?? rules.find((rule) => rule.province === 'کل کشور')
    ?? rules[0];

  return Boolean(provinceRule?.canView ?? true);
}

export function canCompareReportForUser(
  user: User | null | undefined,
  role: UserRole,
  reportKey?: ReportAccessKey
): boolean {
  if (!user) return false;

  const activeRole = role ?? user.role;
  const resolvedKey = reportKey ?? resolveReportAccessKey(activeRole);
  const province = getUserAccessibleProvince(user);

  const rules = listDefaultReportAccessRules().filter(
    (rule) => rule.role === activeRole && rule.reportKey === resolvedKey
  );

  const provinceRule = rules.find((rule) => rule.province === province)
    ?? rules.find((rule) => rule.province === 'کل کشور')
    ?? rules[0];

  return Boolean(provinceRule?.canCompare ?? true);
}

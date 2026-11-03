import {
  REPORT_ACCESS_PROVINCES,
  REPORT_ACCESS_ROLES,
  listDefaultReportAccessRules,
  resolveReportAccessKey,
  type ReportAccessToggle,
} from '@/services/report-access-policy';
import type { User, UserRole } from '@/types/auth';

export const UserPermissionsService = {
  listRules(): ReportAccessToggle[] {
    return listDefaultReportAccessRules();
  },

  getRulesForRole(role: UserRole): ReportAccessToggle[] {
    return this.listRules().filter((rule) => rule.role === role);
  },

  getRolePolicy(role: UserRole, province: string): ReportAccessToggle[] {
    return this.listRules().filter(
      (rule) => rule.role === role && rule.province === province
    );
  },

  toggleView(
    rules: ReportAccessToggle[],
    ruleKey: string,
    checked: boolean
  ): ReportAccessToggle[] {
    return rules.map((rule) => {
      const isTarget = `${rule.role}:${rule.province}:${rule.reportKey}` === ruleKey;
      if (!isTarget) return rule;
      return {
        ...rule,
        canView: checked,
        canCompare: checked ? rule.canCompare : false,
      };
    });
  },

  toggleCompare(
    rules: ReportAccessToggle[],
    ruleKey: string,
    checked: boolean
  ): ReportAccessToggle[] {
    return rules.map((rule) => {
      const isTarget = `${rule.role}:${rule.province}:${rule.reportKey}` === ruleKey;
      return isTarget ? { ...rule, canCompare: checked } : rule;
    });
  },

  resolveReportKey(role: UserRole): string {
    return resolveReportAccessKey(role);
  },

  listAvailableRoles(): UserRole[] {
    return [...REPORT_ACCESS_ROLES];
  },

  listAvailableProvinces(): string[] {
    return [...REPORT_ACCESS_PROVINCES];
  },

  isRoleAllowedForProvince(user: User | null | undefined, role: UserRole): boolean {
    if (!user) return false;
    const scopeProvince = user.province?.[0] ?? 'کل کشور';
    return role === user.role || scopeProvince === 'کل کشور';
  },
};

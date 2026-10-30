import type { UserRole } from '@/types/auth';
import { hasPermission } from '@/utils/role-strategy/helpers';

import { getReportCompareSpec } from '../catalog/compareSpecs';
import { REPORT_BY_ID } from '../catalog/reports';
import {
  ROLE_REPORT_VIEWS,
  REPORTS_BY_ROLE,
  type RoleReportView,
} from '../catalog/roleAccess';
import type { ReportColumnDef, ReportDefinition } from '../catalog/types';

const REPORTS_VIEW_PERMISSION = 'reports.view';

/** نقش‌هایی که منوی گزارش استاندارد در استراتژی دارند یا Word برایشان تعریف کرده. */
export function isReportsRole(role: UserRole | string | null | undefined): boolean {
  if (!role) return false;
  return hasPermission({ role: role as UserRole }, REPORTS_VIEW_PERMISSION);
}

export function reportsForRole(role: UserRole): readonly RoleReportView[] {
  return ROLE_REPORT_VIEWS[role] ?? [];
}

export function reportIdsForRole(role: UserRole): readonly string[] {
  return REPORTS_BY_ROLE[role] ?? [];
}

export function resolveReportLabel(
  report: ReportDefinition,
  role: UserRole
): string {
  const views = ROLE_REPORT_VIEWS[role];
  const fromView = views?.find((v) => v.id === report.id)?.label;
  if (fromView) return fromView;
  if (report.roleLabels?.[role]) return report.roleLabels[role]!;
  if (role === 'super_admin' || role === 'assistant_admin') {
    return (
      report.roleLabels?.central_organization ||
      report.roleLabels?.faculty_role ||
      report.roleLabels?.supervisor_professor ||
      report.title
    );
  }
  return report.title;
}

export function resolveReportColumns(
  report: ReportDefinition,
  role: UserRole
): ReportColumnDef[] {
  const views = ROLE_REPORT_VIEWS[role];
  const fromView = views?.find((v) => v.id === report.id)?.columns;
  if (fromView?.length) {
    return fromView.map((c) => ({ key: c.key, label: c.label }));
  }
  const keys = report.roleColumns?.[role];
  if (!keys?.length) return report.columns;
  const map = Object.fromEntries(report.columns.map((c) => [c.key, c]));
  return keys.map((k) => map[k]).filter(Boolean) as ReportColumnDef[];
}

export function resolveReportFilterKeys(
  report: ReportDefinition,
  role: UserRole
): readonly string[] {
  const views = ROLE_REPORT_VIEWS[role];
  const fromView = views?.find((v) => v.id === report.id)?.filters;
  if (fromView) return fromView;
  return report.filters;
}

/**
 * فیلترهای حالت مقایسه‌ای — جدا از فیلتر استاندارد.
 * تقاطعِ مشخصات مقایسه گزارش × فیلترهای مجاز نقش برای همان گزارش.
 */
export function resolveComparativeFilterKeys(
  report: ReportDefinition,
  role: UserRole
): readonly string[] {
  const spec = getReportCompareSpec(report.id);
  if (!spec) return [];
  const standardAllow = new Set(resolveReportFilterKeys(report, role));
  return spec.filters.filter((k) => standardAllow.has(k));
}

export function comparableReportsForRole(role: UserRole): readonly RoleReportView[] {
  return reportsForRole(role).filter((v) => {
    const def = REPORT_BY_ID[v.id];
    return Boolean(def?.comparable && getReportCompareSpec(v.id));
  });
}

export function getReportDefinition(id: string): ReportDefinition | undefined {
  return REPORT_BY_ID[id];
}

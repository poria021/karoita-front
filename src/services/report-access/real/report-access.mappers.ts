import {
  reportAccessRoleFromApi,
  reportSlugFromApi,
} from '@/services/report-access/report-access-codes';
import type {
  MyReportAccess,
  ReportAccessRoleRow,
  ReportAccessRow,
  ReportAccessStatus,
  ReportSlug,
} from '@/types/report-access';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asStatus(value: unknown): ReportAccessStatus | null {
  return value === 'active' || value === 'inactive' ? value : null;
}

/**
 * `GET /reports/access/me` → اسلاگ‌های فعال و غیرفعال.
 * هر چیزی که در آرایه نیست (یا ناشناخته است) ممنوع فرض می‌شود و اصلاً نمایش داده نمی‌شود.
 */
export function mapMyReportAccess(raw: unknown): MyReportAccess {
  const active: ReportSlug[] = [];
  const inactive: ReportSlug[] = [];
  const reports = isRecord(raw) && Array.isArray(raw.reports) ? raw.reports : [];

  for (const entry of reports) {
    if (!isRecord(entry)) continue;
    const slug = reportSlugFromApi(entry.report);
    const status = asStatus(entry.status);
    if (!slug || !status) continue;
    if (active.includes(slug) || inactive.includes(slug)) continue;
    (status === 'active' ? active : inactive).push(slug);
  }

  return { active, inactive, compare: [] };
}

function mapRow(entry: unknown): ReportAccessRow | null {
  if (!isRecord(entry)) return null;
  const slug = reportSlugFromApi(entry.report);
  const status = asStatus(entry.status);
  if (!slug || !status) return null;

  if (entry.access === 'default') {
    return { slug, access: 'default', status, enabled: true };
  }
  if (entry.access === 'optional') {
    const enabled =
      typeof entry.enabled === 'boolean' ? entry.enabled : status === 'active';
    return { slug, access: 'optional', status, enabled };
  }
  return null;
}

/**
 * `GET /reports/access` → ماتریس نقش‌ها.
 * نقش‌های ناشناخته (مثل `superadmin`) و گزارش‌های ناشناخته حذف می‌شوند.
 */
export function mapReportAccessMatrix(raw: unknown): ReportAccessRoleRow[] {
  if (!Array.isArray(raw)) return [];
  const out: ReportAccessRoleRow[] = [];

  for (const roleEntry of raw) {
    if (!isRecord(roleEntry)) continue;
    const roleId = reportAccessRoleFromApi(roleEntry.role);
    if (!roleId) continue;
    const rows = Array.isArray(roleEntry.reports) ? roleEntry.reports : [];
    const reports: ReportAccessRow[] = [];
    for (const row of rows) {
      const mapped = mapRow(row);
      if (mapped && !reports.some((r) => r.slug === mapped.slug)) {
        reports.push(mapped);
      }
    }
    out.push({ roleId, reports });
  }

  return out;
}

import { RouteService } from '@/services/route.service';
import type { ReportSlug } from '@/types/report-access';

import { DEFAULT_REPORT_SLUG, isReportSlug } from '../constants';

function normalizePath(pathname: string): string {
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

/** مسیر پایهٔ هاب گزارش‌های ادمین (بدون اسلاگ). */
export function reportsHubPath(): string {
  return RouteService.karvita.reports();
}

/** مسیر پایهٔ گزارش‌های سازمانی (بدون اسلاگ). */
export function orgReportsHubPath(): string {
  return RouteService.karvita.orgReports();
}

/** مسیر یک گزارش ادمین؛ اسلاگ نامعتبر → پیش‌فرض `learners`. */
export function reportPath(slug?: string | null): string {
  const resolved =
    slug && isReportSlug(slug) ? slug : DEFAULT_REPORT_SLUG;
  return RouteService.karvita.reports(resolved);
}

/** مسیر یک گزارش سازمانی؛ اسلاگ نامعتبر → پیش‌فرض `learners`. */
export function orgReportPath(slug?: string | null): string {
  const resolved =
    slug && isReportSlug(slug) ? slug : DEFAULT_REPORT_SLUG;
  return RouteService.karvita.orgReports(resolved);
}

export function reportSlugFromParam(
  param: string | string[] | undefined
): ReportSlug {
  const raw = Array.isArray(param) ? param[0] : param;
  if (raw && isReportSlug(raw)) return raw;
  return DEFAULT_REPORT_SLUG;
}

/** مسیر پنل گزارش‌های ادمین (هاب یا اسلاگ). */
export function isAdminReportsPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const path = normalizePath(pathname);
  const base = reportsHubPath();
  return path === base || path.startsWith(`${base}/`);
}

/** مسیر گزارش‌های سازمانی `/karvita/reports`. */
export function isOrgReportsPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const path = normalizePath(pathname);
  const base = orgReportsHubPath();
  return path === base || path.startsWith(`${base}/`);
}

/** اسلاگ گزارش از pathname ادمین؛ نامعتبر/هاب → `null`. */
export function reportSlugFromPathname(
  pathname: string | null | undefined
): ReportSlug | null {
  if (!pathname) return null;
  const path = normalizePath(pathname);
  const base = reportsHubPath();
  if (path === base) return DEFAULT_REPORT_SLUG;
  if (!path.startsWith(`${base}/`)) return null;
  const slug = path.slice(base.length + 1).split('/')[0] ?? '';
  return isReportSlug(slug) ? slug : null;
}

/** اسلاگ گزارش از pathname سازمانی؛ نامعتبر/هاب → `null`. */
export function orgReportSlugFromPathname(
  pathname: string | null | undefined
): ReportSlug | null {
  if (!pathname) return null;
  const path = normalizePath(pathname);
  const base = orgReportsHubPath();
  if (path === base) return DEFAULT_REPORT_SLUG;
  if (!path.startsWith(`${base}/`)) return null;
  const slug = path.slice(base.length + 1).split('/')[0] ?? '';
  return isReportSlug(slug) ? slug : null;
}

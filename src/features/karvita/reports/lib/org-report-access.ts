import {
  APPROVED_ROLE_PAGES,
  ROLE_REPORT_CATALOG,
} from '@/features/karvita/report-access/constants';
import {
  grantedReportSlugsForRole,
  resolveUserProvinceIds,
  roleHasCompareAccess,
  roleHasReportAccess,
} from '@/features/karvita/report-access/lib/access-matrix';
import {
  REPORT_PAGE_DEFS,
  isReportSlug,
} from '@/features/karvita/reports/constants';
import { RouteService } from '@/services/route.service';
import type { UserRole } from '@/types/auth';
import type {
  ReportAccessMatrix,
  ReportAccessRoleId,
  ReportSlug,
} from '@/types/report-access';
import {
  isSidebarMenuGroup,
  type SidebarMenuEntry,
  type SidebarMenuGroup,
  type SidebarMenuItem,
} from '@/utils/role-strategy/types';

/** نقش‌هایی که هاب گزارش سازمانی `/karvita/reports` برایشان زنده است. */
export const ORG_REPORTS_ROLES = [
  'mentor_teacher',
  'supervisor_professor',
  'school_principal',
  'regional_edu_admin',
  'faculty_role',
  'provincial_university',
  'central_organization',
] as const;

export type OrgReportsRole = (typeof ORG_REPORTS_ROLES)[number];

export function isOrgReportsRole(
  role: UserRole | string | null | undefined
): role is OrgReportsRole {
  return (
    typeof role === 'string' &&
    (ORG_REPORTS_ROLES as readonly string[]).includes(role)
  );
}

export function isReportAccessRoleId(
  role: UserRole | string | null | undefined
): role is ReportAccessRoleId {
  return (
    typeof role === 'string' &&
    Object.prototype.hasOwnProperty.call(ROLE_REPORT_CATALOG, role)
  );
}

/** سند مصوب نقش — ترتیب کاتالوگ. */
export function orgApprovedReportSlugs(
  role: OrgReportsRole
): readonly ReportSlug[] {
  return APPROVED_ROLE_PAGES[role];
}

/** کاتالوگ کامل نقش (سند + اختیاری) برای روت/منوی ایستا. */
export function orgCatalogReportSlugs(
  role: OrgReportsRole
): readonly ReportSlug[] {
  return ROLE_REPORT_CATALOG[role];
}

/** اتحاد اسلاگ‌های کاتالوگ همهٔ نقش‌های سازمانی گزارش‌دار (برای روت صفحه). */
export function allOrgRoutableReportSlugs(): readonly ReportSlug[] {
  const seen = new Set<ReportSlug>();
  const out: ReportSlug[] = [];
  for (const role of ORG_REPORTS_ROLES) {
    for (const slug of orgCatalogReportSlugs(role)) {
      if (seen.has(slug)) continue;
      seen.add(slug);
      out.push(slug);
    }
  }
  return out;
}

export function defaultOrgReportSlug(
  role: OrgReportsRole,
  granted?: readonly ReportSlug[]
): ReportSlug {
  if (granted?.length) return granted[0]!;
  return orgApprovedReportSlugs(role)[0] ?? 'learners';
}

export function orgReportMenuItem(slug: ReportSlug): SidebarMenuItem {
  const def = REPORT_PAGE_DEFS[slug];
  return {
    title: def.title,
    path: RouteService.karvita.orgReports(slug),
    icon: def.icon,
  };
}

export function orgReportsSidebarChildren(
  role: OrgReportsRole,
  slugs: readonly ReportSlug[] = orgApprovedReportSlugs(role)
): SidebarMenuItem[] {
  return slugs.map(orgReportMenuItem);
}

export function orgReportsSidebarGroup(
  role: OrgReportsRole,
  slugs?: readonly ReportSlug[]
): SidebarMenuGroup {
  return {
    kind: 'group',
    title: 'گزارش‌گیری',
    icon: 'fa-file-invoice',
    children: orgReportsSidebarChildren(role, slugs),
  };
}

export function resolveOrgUserProvinceIds(
  userProvinces: readonly string[] | undefined,
  provinceNames: Record<string, string>
): string[] {
  return resolveUserProvinceIds(userProvinces, provinceNames);
}

export function canAccessOrgReportSlug(
  role: UserRole | string | null | undefined,
  slug: string,
  matrix?: ReportAccessMatrix | null,
  userProvinceIds: readonly string[] = []
): slug is ReportSlug {
  if (!isOrgReportsRole(role) || !isReportSlug(slug)) return false;
  if (!matrix) {
    return orgApprovedReportSlugs(role).includes(slug);
  }
  return roleHasReportAccess(matrix, role, slug, userProvinceIds);
}

export function canCompareOrgReportSlug(
  role: UserRole | string | null | undefined,
  slug: ReportSlug,
  matrix: ReportAccessMatrix | null | undefined,
  userProvinceIds: readonly string[] = []
): boolean {
  if (!isOrgReportsRole(role) || !matrix) return false;
  return roleHasCompareAccess(matrix, role, slug, userProvinceIds);
}

export function grantedOrgReportSlugs(
  role: OrgReportsRole,
  matrix: ReportAccessMatrix,
  userProvinceIds: readonly string[]
): ReportSlug[] {
  return grantedReportSlugsForRole(matrix, role, userProvinceIds);
}

/**
 * منوی سایدبار را با اسلاگ‌های اعطاشدهٔ ماتریس هم‌تراز می‌کند.
 * اگر هیچ گزارشی نماند، گروه «گزارش‌گیری» حذف می‌شود.
 * `granted === null` → هنوز بارگذاری نشده؛ منوی ایستا دست نخورده می‌ماند.
 */
export function withOrgReportAccessMenu(
  menu: readonly SidebarMenuEntry[],
  role: UserRole | string | null | undefined,
  granted: readonly ReportSlug[] | null
): SidebarMenuEntry[] {
  if (!isOrgReportsRole(role) || granted === null) {
    return menu.slice();
  }

  const next: SidebarMenuEntry[] = [];
  for (const entry of menu) {
    if (
      isSidebarMenuGroup(entry) &&
      entry.title === 'گزارش‌گیری' &&
      entry.children.some((child) =>
        child.path.startsWith(RouteService.karvita.orgReports())
      )
    ) {
      if (!granted.length) continue;
      next.push(orgReportsSidebarGroup(role, granted));
      continue;
    }
    next.push(entry);
  }
  return next;
}

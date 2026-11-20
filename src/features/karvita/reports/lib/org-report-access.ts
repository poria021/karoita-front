import {
  APPROVED_ROLE_PAGES,
  COMPARE_REPORT_SLUGS,
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
  REPORT_THEMES,
  REPORT_COMPARE_ENABLED,
  filterEnabledReportSlugs,
  isEnabledReportSlug,
  isReportSlug,
} from '@/features/karvita/reports/constants';
import { RouteService } from '@/services/route.service';
import type { UserRole } from '@/types/auth';
import type {
  ReportAccessMatrix,
  ReportAccessRoleId,
  ReportSlug,
} from '@/types/report-access';
import type { ReportFilterKey } from '@/types/reports';
import {
  isSidebarMenuGroup,
  type SidebarMenuEntry,
  type SidebarMenuGroup,
  type SidebarMenuItem,
} from '@/utils/role-strategy/types';

const REPORT_THEME_ICONS: Record<string, string> = {
  lists: 'fa-table-columns',
  attendance: 'fa-clipboard-check',
  performance: 'fa-chart-column',
};

/** اسلاگ‌هایی که آیتم منویشان نمایش داده می‌شود ولی غیرفعال است (`status=inactive`). */
type DisabledReportSlugs = ReadonlySet<ReportSlug>;
const NO_DISABLED_SLUGS: DisabledReportSlugs = new Set<ReportSlug>();

function isOrgReportsMenuGroup(
  entry: SidebarMenuEntry
): entry is SidebarMenuGroup {
  return (
    isSidebarMenuGroup(entry) &&
    entry.children.some((child) =>
      child.path.startsWith(RouteService.karvita.orgReports())
    )
  );
}

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

/** فیلترهایی که برای نقش در UI گزارش نشان داده نمی‌شوند. */
const NO_HIDDEN_REPORT_FILTERS: readonly ReportFilterKey[] = [];

/** همهٔ کلیدهای فیلتر گزارش — برای ساخت allowlist نقش. */
const ALL_REPORT_FILTER_KEYS: readonly ReportFilterKey[] = [
  'province',
  'city',
  'region',
  'school',
  'faculty',
  'professor',
  'teacher',
  'course',
  'major',
  'status',
];

/**
 * فیلترهای مجاز هر نقش برای همهٔ گزارش‌ها (allowlist).
 * مدیر ارشد / سازمان مرکزی → بدون محدودیت (همان فیلترهای صفحه).
 */
const ALLOWED_REPORT_FILTERS_BY_ROLE: Partial<
  Record<UserRole, readonly ReportFilterKey[]>
> = {
  regional_edu_admin: ['school', 'teacher'],
  school_principal: ['teacher'],
  mentor_teacher: ['region', 'school'],
  supervisor_professor: ['province', 'faculty', 'school'],
};

/**
 * فیلترهایی که از مجموعهٔ صفحه حذف می‌شوند (denylist).
 * دانشگاه استانی: استان + معلم
 * دانشکده: شهر + معلم
 */
const HIDDEN_REPORT_FILTERS_BY_ROLE: Partial<
  Record<UserRole, readonly ReportFilterKey[]>
> = {
  provincial_university: ['province', 'teacher'],
  faculty_role: ['city', 'teacher'],
};

/** فیلترهایی که روی بعضی اسلاگ‌ها برای همهٔ نقش‌ها حذف‌اند. */
const HIDDEN_REPORT_FILTERS_BY_SLUG: Partial<
  Record<ReportSlug, readonly ReportFilterKey[]>
> = {
  principals: ['teacher', 'school'],
  schools: ['teacher', 'school'],
  // نمرات فراگیران: شهر در API نیست.
  scores: ['city'],
};

function hiddenKeysOutsideAllowlist(
  allowed: readonly ReportFilterKey[]
): readonly ReportFilterKey[] {
  const keep = new Set(allowed);
  return ALL_REPORT_FILTER_KEYS.filter((key) => !keep.has(key));
}

function mergeHiddenFilterKeys(
  ...groups: Array<readonly ReportFilterKey[] | undefined>
): readonly ReportFilterKey[] {
  const out: ReportFilterKey[] = [];
  const seen = new Set<ReportFilterKey>();
  for (const group of groups) {
    if (!group) continue;
    for (const key of group) {
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(key);
    }
  }
  return out;
}

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

export function orgReportMenuItem(
  slug: ReportSlug,
  disabled = false
): SidebarMenuItem {
  const def = REPORT_PAGE_DEFS[slug];
  return {
    title: def.title,
    path: RouteService.karvita.orgReports(slug),
    icon: def.icon,
    ...(disabled ? { disabled: true } : {}),
  };
}

export function orgReportsSidebarChildren(
  role: OrgReportsRole,
  slugs: readonly ReportSlug[] = orgApprovedReportSlugs(role),
  disabled: DisabledReportSlugs = NO_DISABLED_SLUGS
): SidebarMenuItem[] {
  return filterEnabledReportSlugs(slugs, role).map((slug) =>
    orgReportMenuItem(slug, disabled.has(slug))
  );
}

/** ماژول «گزارش‌گیری» با انواع گزارش به‌صورت زیرماژول (نقش‌های غیرمرکزی). */
export function orgReportsSidebarGroup(
  role: OrgReportsRole,
  slugs?: readonly ReportSlug[],
  disabled: DisabledReportSlugs = NO_DISABLED_SLUGS
): SidebarMenuGroup {
  return {
    kind: 'group',
    title: 'گزارش‌گیری',
    icon: 'fa-file-invoice',
    children: orgReportsSidebarChildren(role, slugs, disabled),
  };
}

/** ترتیب نمایش منو: سند مصوب، بعد اسلاگ‌های اختیاری اعطاشده. */
export function orderOrgReportSlugsForMenu(
  role: OrgReportsRole,
  granted: readonly ReportSlug[]
): ReportSlug[] {
  const grantedSet = new Set(granted);
  const ordered: ReportSlug[] = [];
  for (const slug of orgApprovedReportSlugs(role)) {
    if (grantedSet.has(slug)) ordered.push(slug);
  }
  for (const slug of granted) {
    if (!ordered.includes(slug)) ordered.push(slug);
  }
  return filterEnabledReportSlugs(ordered, role);
}

/** نقش‌هایی که گزارش‌ها را در سه ماژول تم می‌بینند. */
const THEMED_ORG_REPORTS_ROLES = new Set<OrgReportsRole>([
  'central_organization',
  'provincial_university',
  'regional_edu_admin',
  'faculty_role',
]);

export function usesThemedOrgReportSidebar(
  role: UserRole | string | null | undefined
): boolean {
  return (
    typeof role === 'string' &&
    THEMED_ORG_REPORTS_ROLES.has(role as OrgReportsRole)
  );
}

/**
 * کلید فیلترهایی که برای نقش نباید در گزارش دیده شوند.
 * allowlist/denylist نقش + حذف‌های ثابت بعضی اسلاگ‌ها.
 */
export function hiddenReportFilterKeysForRole(
  role: UserRole | string | null | undefined,
  slug?: ReportSlug
): readonly ReportFilterKey[] {
  const slugHidden =
    slug != null ? HIDDEN_REPORT_FILTERS_BY_SLUG[slug] : undefined;
  if (typeof role !== 'string') {
    return slugHidden ?? NO_HIDDEN_REPORT_FILTERS;
  }
  const allowed = ALLOWED_REPORT_FILTERS_BY_ROLE[role as UserRole];
  const roleHidden = allowed
    ? hiddenKeysOutsideAllowlist(allowed)
    : (HIDDEN_REPORT_FILTERS_BY_ROLE[role as UserRole] ??
      NO_HIDDEN_REPORT_FILTERS);
  return mergeHiddenFilterKeys(roleHidden, slugHidden);
}

/**
 * فیلترهایی که برای نقش باید در UI باشند (حتی اگر در تعریف صفحه نباشند).
 * فقط برای نقش‌های allowlist‌دار؛ روی اسلاگ‌های خاص، teacher/school تزریق نمی‌شود.
 */
export function extraReportFilterKeysForRole(
  role: UserRole | string | null | undefined,
  slug?: ReportSlug
): readonly ReportFilterKey[] {
  if (typeof role !== 'string') return NO_HIDDEN_REPORT_FILTERS;
  const extras =
    ALLOWED_REPORT_FILTERS_BY_ROLE[role as UserRole] ??
    NO_HIDDEN_REPORT_FILTERS;
  if (!extras.length) return extras;
  const slugHidden =
    slug != null ? HIDDEN_REPORT_FILTERS_BY_SLUG[slug] : undefined;
  if (!slugHidden?.length) return extras;
  const banned = new Set(slugHidden);
  return extras.filter((key) => !banned.has(key));
}

/**
 * سه ماژول جدا:
 * گزارش‌های لیستی / حضور و غیاب / گزارش‌های عملکرد
 */
export function orgReportsThemedSidebarGroups(
  slugs: readonly ReportSlug[],
  role?: OrgReportsRole,
  disabled: DisabledReportSlugs = NO_DISABLED_SLUGS
): SidebarMenuGroup[] {
  const allowed = new Set(filterEnabledReportSlugs(slugs, role));
  return REPORT_THEMES.map((theme) => ({
    kind: 'group' as const,
    title: theme.title,
    icon: REPORT_THEME_ICONS[theme.id] ?? 'fa-file-invoice',
    children: theme.slugs
      .filter(
        (slug) => allowed.has(slug) && isEnabledReportSlug(slug, role)
      )
      .map((slug) => orgReportMenuItem(slug, disabled.has(slug))),
  })).filter((group) => group.children.length > 0);
}

/**
 * ورودی‌های سایدبار گزارش.
 * سازمان مرکزی / دانشگاه استانی / آموزش‌و‌پرورش منطقه / دانشکده → ماژول‌های دسته‌بندی‌شده؛ بقیه → یک «گزارش‌گیری».
 */
export function orgReportsSidebarEntries(
  role: OrgReportsRole,
  slugs?: readonly ReportSlug[],
  disabled: DisabledReportSlugs = NO_DISABLED_SLUGS
): SidebarMenuGroup[] {
  const list = slugs ?? orgApprovedReportSlugs(role);
  if (usesThemedOrgReportSidebar(role)) {
    return orgReportsThemedSidebarGroups(list, role, disabled);
  }
  return [orgReportsSidebarGroup(role, list, disabled)];
}

/* --- مسیر ماتریس استانی (ماکت قدیمی)؛ سایدبار/گارد دیگر از این‌ها استفاده نمی‌کنند --- */

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
  if (!isEnabledReportSlug(slug, role)) return false;
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

/* --- مسیر زندهٔ `GET /reports/access/me` --- */

/**
 * گیت صفحهٔ گزارش از روی پاسخ `/me`:
 * فقط `status=active` اجازهٔ ورود/فراخوانی API گزارش دارد؛ `inactive` و غایب ممنوع‌اند.
 * `granted === null` (هنوز بارگذاری نشده) → رد.
 */
export function isOrgReportGranted(
  role: UserRole | string | null | undefined,
  slug: string,
  granted: readonly ReportSlug[] | null
): slug is ReportSlug {
  if (!isOrgReportsRole(role) || !isReportSlug(slug)) return false;
  if (!isEnabledReportSlug(slug, role)) return false;
  return granted?.includes(slug) ?? false;
}

/** مقایسه فقط روی گزارشی که فعال است و زیرمجوزش (فقط ماکت) آمده باشد. */
export function canCompareOrgGrantedSlug(
  role: UserRole | string | null | undefined,
  slug: ReportSlug,
  granted: readonly ReportSlug[] | null,
  compare: readonly ReportSlug[]
): boolean {
  if (!isOrgReportGranted(role, slug, granted)) return false;
  if (compare.includes(slug)) return true;
  // سازمان مرکزی: مقایسهٔ عملکرد دانشکده‌ها/استان‌ها همراه با خودِ گزارش فعال است.
  return (
    REPORT_COMPARE_ENABLED &&
    role === 'central_organization' &&
    COMPARE_REPORT_SLUGS.includes(slug)
  );
}

/**
 * منوی سایدبار را با پاسخ `/me` هم‌تراز می‌کند.
 * - `granted` (active): آیتم باز.
 * - `inactive`: آیتم نمایش داده می‌شود ولی غیرفعال (`disabled`) و کلیک‌ناپذیر.
 * - هر گزارشی که در هیچ‌کدام نیست ممنوع است و اصلاً نمایش داده نمی‌شود.
 * اگر هیچ گزارشی نماند، گروه‌های گزارش حذف می‌شوند.
 * `granted === null` → هنوز بارگذاری نشده؛ منوی ایستا دست نخورده می‌ماند.
 */
export function withOrgReportAccessMenu(
  menu: readonly SidebarMenuEntry[],
  role: UserRole | string | null | undefined,
  granted: readonly ReportSlug[] | null,
  inactive: readonly ReportSlug[] = []
): SidebarMenuEntry[] {
  if (!isOrgReportsRole(role) || granted === null) {
    return menu.slice();
  }

  const grantedSet = new Set(granted);
  const inactiveOnly = inactive.filter((slug) => !grantedSet.has(slug));
  const ordered = orderOrgReportSlugsForMenu(role, [
    ...granted,
    ...inactiveOnly,
  ]);
  const disabled: DisabledReportSlugs = new Set(inactiveOnly);
  const next: SidebarMenuEntry[] = [];
  let reportsInserted = false;
  for (const entry of menu) {
    if (isOrgReportsMenuGroup(entry)) {
      if (!reportsInserted) {
        if (ordered.length) {
          next.push(...orgReportsSidebarEntries(role, ordered, disabled));
        }
        reportsInserted = true;
      }
      continue;
    }
    next.push(entry);
  }
  return next;
}

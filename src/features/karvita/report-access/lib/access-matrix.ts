import {
  APPROVED_ROLE_PAGES,
  COMPARE_REPORT_SLUGS,
  ROLE_REPORT_CATALOG,
  REPORT_ACCESS_ROLES,
  compareKeyFor,
} from '@/features/karvita/report-access/constants';
import type {
  ReportAccessDiff,
  ReportAccessMatrix,
  ReportAccessRoleId,
  ReportAccessSwitchState,
  ReportSlug,
} from '@/types/report-access';

export function cloneMatrix(matrix: ReportAccessMatrix): ReportAccessMatrix {
  return JSON.parse(JSON.stringify(matrix)) as ReportAccessMatrix;
}

function sameProvinceLists(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id) => b.includes(id));
}

/** سند مصوب: ROLE_PAGES در همه‌ی استان‌ها؛ مقایسه پیش‌فرض خاموش. */
export function buildApprovedDocument(
  provinceIds: readonly string[]
): ReportAccessMatrix {
  const all = provinceIds.slice();
  const matrix = {} as ReportAccessMatrix;

  for (const roleId of REPORT_ACCESS_ROLES) {
    const row: Record<string, string[]> = {};
    for (const slug of ROLE_REPORT_CATALOG[roleId]) {
      row[slug] = APPROVED_ROLE_PAGES[roleId].includes(slug) ? all.slice() : [];
    }
    for (const slug of COMPARE_REPORT_SLUGS) {
      if (ROLE_REPORT_CATALOG[roleId].includes(slug)) {
        row[compareKeyFor(slug)] = [];
      }
    }
    matrix[roleId] = row;
  }

  return matrix;
}

/** ادغام ماتریس ذخیره‌شده با سند پایه (اسلاگ‌ها/استان‌های نامعتبر حذف می‌شوند). */
export function normalizeMatrix(
  raw: unknown,
  provinceIds: readonly string[]
): ReportAccessMatrix {
  const base = buildApprovedDocument(provinceIds);
  if (!raw || typeof raw !== 'object') return base;

  const source = raw as Record<string, Record<string, unknown>>;
  for (const roleId of REPORT_ACCESS_ROLES) {
    const roleRaw = source[roleId];
    if (!roleRaw || typeof roleRaw !== 'object') continue;

    for (const slug of ROLE_REPORT_CATALOG[roleId]) {
      const list = roleRaw[slug];
      if (Array.isArray(list)) {
        base[roleId][slug] = provinceIds.filter((id) =>
          list.includes(id)
        );
      }
    }

    for (const slug of COMPARE_REPORT_SLUGS) {
      if (!ROLE_REPORT_CATALOG[roleId].includes(slug)) continue;
      const key = compareKeyFor(slug);
      const list = roleRaw[key];
      const view = base[roleId][slug] ?? [];
      base[roleId][key] = Array.isArray(list)
        ? provinceIds.filter((id) => list.includes(id) && view.includes(id))
        : [];
    }
  }

  return base;
}

export function viewAccess(
  matrix: ReportAccessMatrix,
  roleId: ReportAccessRoleId,
  slug: ReportSlug,
  provinceIds: readonly string[],
  scope: 'all' | string = 'all'
): ReportAccessSwitchState {
  const list = matrix[roleId]?.[slug] ?? [];
  if (scope === 'all') {
    if (list.length === provinceIds.length) return 'on';
    if (list.length > 0) return 'mixed';
    return 'off';
  }
  return list.includes(scope) ? 'on' : 'off';
}

export function setAccess(
  matrix: ReportAccessMatrix,
  roleId: ReportAccessRoleId,
  slug: ReportSlug,
  provinceIds: readonly string[],
  on: boolean,
  scope: 'all' | string = 'all'
): void {
  const row = matrix[roleId];
  if (!row) return;

  if (scope === 'all') {
    row[slug] = on ? provinceIds.slice() : [];
  } else {
    const has = row[slug]?.includes(scope) ?? false;
    if (on && !has) {
      row[slug] = provinceIds.filter(
        (id) => (row[slug] ?? []).includes(id) || id === scope
      );
    }
    if (!on && has) {
      row[slug] = (row[slug] ?? []).filter((id) => id !== scope);
    }
  }

  const cmpKey = compareKeyFor(slug);
  if (row[cmpKey]) {
    row[cmpKey] = row[cmpKey].filter((id) => (row[slug] ?? []).includes(id));
  }
}

export function viewCompare(
  matrix: ReportAccessMatrix,
  roleId: ReportAccessRoleId,
  slug: ReportSlug,
  scope: 'all' | string = 'all'
): ReportAccessSwitchState {
  const view = matrix[roleId]?.[slug] ?? [];
  const cmp = matrix[roleId]?.[compareKeyFor(slug)] ?? [];

  if (scope === 'all') {
    if (!view.length) return 'locked';
    if (!cmp.length) return 'off';
    if (cmp.length === view.length) return 'on';
    return 'mixed';
  }

  if (!view.includes(scope)) return 'locked';
  return cmp.includes(scope) ? 'on' : 'off';
}

export function setCompare(
  matrix: ReportAccessMatrix,
  roleId: ReportAccessRoleId,
  slug: ReportSlug,
  provinceIds: readonly string[],
  on: boolean,
  scope: 'all' | string = 'all'
): void {
  const row = matrix[roleId];
  if (!row) return;
  const key = compareKeyFor(slug);
  if (!row[key]) row[key] = [];

  if (scope === 'all') {
    row[key] = on ? (row[slug] ?? []).slice() : [];
    return;
  }

  const has = row[key].includes(scope);
  if (on && !has && (row[slug] ?? []).includes(scope)) {
    row[key] = provinceIds.filter(
      (id) => row[key].includes(id) || id === scope
    );
  }
  if (!on && has) {
    row[key] = row[key].filter((id) => id !== scope);
  }
}

export function diffMatrices(
  saved: ReportAccessMatrix,
  draft: ReportAccessMatrix
): ReportAccessDiff[] {
  const out: ReportAccessDiff[] = [];

  for (const roleId of REPORT_ACCESS_ROLES) {
    for (const slug of ROLE_REPORT_CATALOG[roleId]) {
      const a = saved[roleId]?.[slug] ?? [];
      const b = draft[roleId]?.[slug] ?? [];
      if (!sameProvinceLists(a, b)) {
        out.push({
          roleId,
          key: slug,
          add: b.filter((id) => !a.includes(id)),
          rem: a.filter((id) => !b.includes(id)),
        });
      }

      if (!COMPARE_REPORT_SLUGS.includes(slug)) continue;
      const cmpKey = compareKeyFor(slug);
      const ca = saved[roleId]?.[cmpKey] ?? [];
      const cb = draft[roleId]?.[cmpKey] ?? [];
      if (!sameProvinceLists(ca, cb)) {
        out.push({
          roleId,
          key: cmpKey,
          add: cb.filter((id) => !ca.includes(id)),
          rem: ca.filter((id) => !cb.includes(id)),
        });
      }
    }
  }

  return out;
}

export function isDirtyForSlug(
  saved: ReportAccessMatrix,
  draft: ReportAccessMatrix,
  roleId: ReportAccessRoleId,
  slug: ReportSlug,
  scope: 'all' | string = 'all'
): boolean {
  const a = saved[roleId]?.[slug] ?? [];
  const b = draft[roleId]?.[slug] ?? [];
  if (scope === 'all') return !sameProvinceLists(a, b);
  return a.includes(scope) !== b.includes(scope);
}

export function isDirtyForCompare(
  saved: ReportAccessMatrix,
  draft: ReportAccessMatrix,
  roleId: ReportAccessRoleId,
  slug: ReportSlug,
  scope: 'all' | string = 'all'
): boolean {
  const key = compareKeyFor(slug);
  const a = saved[roleId]?.[key] ?? [];
  const b = draft[roleId]?.[key] ?? [];
  if (scope === 'all') return !sameProvinceLists(a, b);
  return a.includes(scope) !== b.includes(scope);
}

export function matricesEqual(
  a: ReportAccessMatrix,
  b: ReportAccessMatrix
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * نام/شناسهٔ استان کاربر را به شناسه‌های کاتالوگ ماتریس نگاشت می‌کند.
 * اگر کاربر استان نداشته باشد (مثل سازمان مرکزی) → آرایهٔ خالی = حوزهٔ ملی.
 */
export function resolveUserProvinceIds(
  userProvinces: readonly string[] | undefined,
  provinceNames: Record<string, string>
): string[] {
  if (!userProvinces?.length) return [];

  const nameToId = new Map<string, string>();
  for (const [id, name] of Object.entries(provinceNames)) {
    nameToId.set(name, id);
  }

  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of userProvinces) {
    const id =
      raw in provinceNames ? raw : (nameToId.get(raw) ?? null);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/**
 * آیا نقش برای حوزهٔ استان کاربر به گزارش دسترسی دارد؟
 * حوزهٔ ملی (بدون استان روی کاربر): هر اعطای غیرخالی کافی است.
 */
export function roleHasReportAccess(
  matrix: ReportAccessMatrix,
  roleId: ReportAccessRoleId,
  slug: ReportSlug,
  userProvinceIds: readonly string[]
): boolean {
  const list = matrix[roleId]?.[slug] ?? [];
  if (!list.length) return false;
  if (!userProvinceIds.length) return true;
  return userProvinceIds.some((id) => list.includes(id));
}

/** زیرمجوز مقایسه فقط وقتی گزارش هم برای همان حوزه اعطا شده باشد. */
export function roleHasCompareAccess(
  matrix: ReportAccessMatrix,
  roleId: ReportAccessRoleId,
  slug: ReportSlug,
  userProvinceIds: readonly string[]
): boolean {
  if (!COMPARE_REPORT_SLUGS.includes(slug)) return false;
  if (!roleHasReportAccess(matrix, roleId, slug, userProvinceIds)) {
    return false;
  }
  const cmp = matrix[roleId]?.[compareKeyFor(slug)] ?? [];
  if (!cmp.length) return false;
  if (!userProvinceIds.length) return true;
  return userProvinceIds.some((id) => cmp.includes(id));
}

/** اسلاگ‌های اعطاشدهٔ نقش به ترتیب کاتالوگ (سند + اختیاری). */
export function grantedReportSlugsForRole(
  matrix: ReportAccessMatrix,
  roleId: ReportAccessRoleId,
  userProvinceIds: readonly string[]
): ReportSlug[] {
  return ROLE_REPORT_CATALOG[roleId].filter((slug) =>
    roleHasReportAccess(matrix, roleId, slug, userProvinceIds)
  );
}

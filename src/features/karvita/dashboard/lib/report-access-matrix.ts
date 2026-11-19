import {
  REPORT_ACCESS_ROLES,
  REPORT_ACCESS_THEMES,
  REPORT_PAGE_META,
} from '@/features/karvita/report-access/constants';
import type {
  ReportAccessRoleId,
  ReportAccessRoleRow,
  ReportSlug,
} from '@/types/report-access';

/**
 * حالت یک خانهٔ ماتریس «نقش × گزارش»:
 * - `default`   گزارش پیش‌فرض نقش (همیشه فعال)
 * - `granted`   اختیاری و توسط مدیر ارشد فعال شده
 * - `available` اختیاری و هنوز فعال‌نشده (قابل اعطا)
 * - `none`      برای این نقش اصلاً تعریف نشده (ممنوع)
 */
export type ReportAccessCellState =
  | 'default'
  | 'granted'
  | 'available'
  | 'none';

export type ReportAccessThemeId = 'lists' | 'attendance' | 'performance';

/** نام کوتاه ستون‌ها (برای سربرگ عمودی)؛ نام کامل در tooltip و متن زندهٔ پایین. */
export const REPORT_SHORT_LABEL: Readonly<Record<ReportSlug, string>> = {
  learners: 'فراگیران',
  teachers: 'معلمان',
  principals: 'مدیران مدارس',
  professors: 'اساتید',
  schools: 'مدارس',
  faculties: 'دانشکده‌ها',
  provinces: 'استان‌ها',
  attendance: 'حضور فراگیران',
  'professor-attendance': 'حضور اساتید',
  scores: 'نمرات',
  'teacher-performance': 'عملکرد معلمان',
  'school-performance': 'عملکرد مدارس',
  'professor-performance': 'عملکرد اساتید',
  'faculty-performance': 'عملکرد دانشکده‌ها',
  'province-performance': 'عملکرد استان‌ها',
};

export type ReportAccessMatrixColumn = {
  slug: ReportSlug;
  title: string;
  shortLabel: string;
  themeId: ReportAccessThemeId;
  /** اولین ستون گروه (برای جداکنندهٔ نازک بین گروه‌ها). */
  groupStart: boolean;
};

export type ReportAccessMatrixTheme = {
  id: ReportAccessThemeId;
  title: string;
  span: number;
};

export type ReportAccessMatrixRow = {
  roleId: ReportAccessRoleId;
  cells: Record<ReportSlug, ReportAccessCellState>;
  /** گزارش فعال (default + granted). */
  active: number;
  /** همهٔ گزارش‌های تعریف‌شده برای نقش (فعال + قابل اعطا). */
  total: number;
  /** اختیاری‌های هنوز فعال‌نشده. */
  pending: number;
};

export type ReportAccessMatrixTotals = {
  active: number;
  total: number;
  pending: number;
  /** نقشی که هیچ گزارش فعالی ندارد. */
  rolesWithoutReport: number;
};

export type ReportAccessMatrixView = {
  themes: ReportAccessMatrixTheme[];
  columns: ReportAccessMatrixColumn[];
  rows: ReportAccessMatrixRow[];
  totals: ReportAccessMatrixTotals;
};

const THEME_IDS = new Set<string>(['lists', 'attendance', 'performance']);

export function buildReportAccessColumns(): {
  themes: ReportAccessMatrixTheme[];
  columns: ReportAccessMatrixColumn[];
} {
  const themes: ReportAccessMatrixTheme[] = [];
  const columns: ReportAccessMatrixColumn[] = [];
  for (const theme of REPORT_ACCESS_THEMES) {
    if (!THEME_IDS.has(theme.id)) continue;
    const themeId = theme.id as ReportAccessThemeId;
    themes.push({ id: themeId, title: theme.title, span: theme.slugs.length });
    theme.slugs.forEach((slug, index) => {
      columns.push({
        slug,
        title: REPORT_PAGE_META[slug].title,
        shortLabel: REPORT_SHORT_LABEL[slug],
        themeId,
        groupStart: index === 0,
      });
    });
  }
  return { themes, columns };
}

export function cellStateOf(
  row: ReportAccessRoleRow | undefined,
  slug: ReportSlug
): ReportAccessCellState {
  const entry = row?.reports.find((report) => report.slug === slug);
  if (!entry) return 'none';
  if (entry.access === 'default') {
    return entry.status === 'active' ? 'default' : 'available';
  }
  return entry.status === 'active' ? 'granted' : 'available';
}

/** `GET /reports/access` → ماتریس آمادهٔ نمایش (ترتیب نقش‌ها طبق کاتالوگ). */
export function buildReportAccessMatrix(
  rows: readonly ReportAccessRoleRow[]
): ReportAccessMatrixView {
  const { themes, columns } = buildReportAccessColumns();
  const byRole = new Map(rows.map((row) => [row.roleId, row]));
  const orderedRoles = REPORT_ACCESS_ROLES.filter((roleId) =>
    byRole.has(roleId)
  );

  const matrixRows: ReportAccessMatrixRow[] = orderedRoles.map((roleId) => {
    const source = byRole.get(roleId);
    const cells = {} as Record<ReportSlug, ReportAccessCellState>;
    let active = 0;
    let pending = 0;
    let total = 0;
    for (const column of columns) {
      const state = cellStateOf(source, column.slug);
      cells[column.slug] = state;
      if (state === 'none') continue;
      total += 1;
      if (state === 'available') pending += 1;
      else active += 1;
    }
    return { roleId, cells, active, total, pending };
  });

  const totals = matrixRows.reduce<ReportAccessMatrixTotals>(
    (acc, row) => ({
      active: acc.active + row.active,
      total: acc.total + row.total,
      pending: acc.pending + row.pending,
      rolesWithoutReport: acc.rolesWithoutReport + (row.active === 0 ? 1 : 0),
    }),
    { active: 0, total: 0, pending: 0, rolesWithoutReport: 0 }
  );

  return { themes, columns, rows: matrixRows, totals };
}

export const CELL_STATE_LABEL: Readonly<Record<ReportAccessCellState, string>> =
  {
    default: 'پیش‌فرض و فعال',
    granted: 'اختیاری — فعال‌شده',
    available: 'اختیاری — هنوز فعال نشده',
    none: 'برای این نقش تعریف نشده',
  };

/** جملهٔ توصیفی یک خانه: «نقش ← گزارش: وضعیت». */
export function describeCell(
  roleLabel: string,
  column: Pick<ReportAccessMatrixColumn, 'title'>,
  state: ReportAccessCellState
): string {
  return `${roleLabel} ← ${column.title}: ${CELL_STATE_LABEL[state]}`;
}

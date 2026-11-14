import {
  APPROVED_ROLE_PAGES,
  REPORT_ACCESS_ROLES,
  ROLE_REPORT_CATALOG,
} from '@/features/karvita/report-access/constants';
import {
  buildApprovedDocument,
  normalizeMatrix,
  roleHasCompareAccess,
  roleHasReportAccess,
  setAccess,
  setCompare,
} from '@/features/karvita/report-access/lib/access-matrix';
import { ENABLED_REPORT_SLUGS } from '@/features/karvita/reports/constants';
import { mockReportAccessProvinceCatalog } from '@/services/report-access/mock/mock-report-access-seed';
import type {
  MyReportAccess,
  ReportAccessMatrix,
  ReportAccessRoleId,
  ReportAccessRoleRow,
  ReportAccessRow,
  ReportAccessSnapshot,
  ReportSlug,
} from '@/types/report-access';

const STORAGE_KEY = 'karvita.report-access.v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function provinceCatalog() {
  return mockReportAccessProvinceCatalog();
}

/**
 * محتوای اولیهٔ ماکت — سند مصوب + چند نمونه اعطا/مقایسه برای نمایش زندهٔ UI.
 */
export function buildMockReportAccessSeedMatrix(
  provinceIds: readonly string[]
): ReportAccessMatrix {
  const matrix = buildApprovedDocument(provinceIds);

  // معلم راهنما: حضور هم اعطا شده (خارج از سند مصوب)
  setAccess(matrix, 'mentor_teacher', 'attendance', provinceIds, true);

  // استاد راهنما: امکان مقایسه روی حضور فراگیران
  setCompare(matrix, 'supervisor_professor', 'attendance', provinceIds, true);

  // مدیر مدرسه: عملکرد معلمان با مقایسه
  setCompare(
    matrix,
    'school_principal',
    'teacher-performance',
    provinceIds,
    true
  );

  // دستیار مدیر ارشد: چند گزارش لیستی برای دموی تب خالیِ سند مصوب
  setAccess(matrix, 'assistant_admin', 'learners', provinceIds, true);
  setAccess(matrix, 'assistant_admin', 'teachers', provinceIds, true);
  setAccess(matrix, 'assistant_admin', 'schools', provinceIds, true);

  // سازمان مرکزی: مقایسه عملکرد استان‌ها
  setCompare(
    matrix,
    'central_organization',
    'province-performance',
    provinceIds,
    true
  );

  return matrix;
}

function readStoredRaw(): unknown {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function mockGetReportAccessSnapshot(): ReportAccessSnapshot {
  const { provinceIds, provinceNames } = provinceCatalog();
  const stored = readStoredRaw();
  const matrix = stored
    ? normalizeMatrix(stored, provinceIds)
    : buildMockReportAccessSeedMatrix(provinceIds);

  return { matrix, provinceIds, provinceNames };
}

export function mockSaveReportAccessMatrix(
  matrix: ReportAccessMatrix
): ReportAccessSnapshot {
  const { provinceIds, provinceNames } = provinceCatalog();
  const next = normalizeMatrix(matrix, provinceIds);
  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return { matrix: next, provinceIds, provinceNames };
}

export function mockApprovedReportAccessDocument(): ReportAccessMatrix {
  const { provinceIds } = provinceCatalog();
  return buildApprovedDocument(provinceIds);
}

/* ------------------------------------------------------------------ */
/* هم‌شکل‌سازی ماکت با قرارداد Nest (/reports/access*)                   */
/* سند مصوب = default؛ گزارش‌های اضافهٔ کاتالوگ = optional.             */
/* ------------------------------------------------------------------ */

function isReportAccessRoleId(role: string): role is ReportAccessRoleId {
  return (REPORT_ACCESS_ROLES as readonly string[]).includes(role);
}

/** معادل `GET /reports/access/me` روی ماکت. */
export function mockGetMyReportAccess(role: string): MyReportAccess {
  const result: MyReportAccess = { active: [], inactive: [], compare: [] };
  // سوپرادمین در ماتریس نقش نیست؛ در ماکت همهٔ گزارش‌های زنده را active می‌بیند.
  if (role === 'super_admin') {
    return { active: [...ENABLED_REPORT_SLUGS], inactive: [], compare: [] };
  }
  if (!isReportAccessRoleId(role)) return result;

  const { matrix } = mockGetReportAccessSnapshot();
  const approved = APPROVED_ROLE_PAGES[role];

  for (const slug of ROLE_REPORT_CATALOG[role]) {
    const on = approved.includes(slug) || roleHasReportAccess(matrix, role, slug, []);
    (on ? result.active : result.inactive).push(slug);
    if (on && roleHasCompareAccess(matrix, role, slug, [])) {
      result.compare.push(slug);
    }
  }
  return result;
}

/** معادل `GET /reports/access` روی ماکت. */
export function mockGetReportAccessMatrix(): ReportAccessRoleRow[] {
  const { matrix } = mockGetReportAccessSnapshot();

  return REPORT_ACCESS_ROLES.map((roleId) => {
    const approved = APPROVED_ROLE_PAGES[roleId];
    const reports: ReportAccessRow[] = ROLE_REPORT_CATALOG[roleId].map(
      (slug) => {
        if (approved.includes(slug)) {
          return { slug, access: 'default', status: 'active', enabled: true };
        }
        const enabled = roleHasReportAccess(matrix, roleId, slug, []);
        return {
          slug,
          access: 'optional',
          status: enabled ? 'active' : 'inactive',
          enabled,
        };
      }
    );
    return { roleId, reports };
  });
}

/** معادل `PATCH /reports/access/:role` روی ماکت؛ پیام‌های ۴۰۰ هم‌متن بک‌اند. */
export function mockSetReportEnabled(
  roleId: ReportAccessRoleId,
  slug: ReportSlug,
  enabled: boolean
): void {
  if (APPROVED_ROLE_PAGES[roleId].includes(slug)) {
    throw new Error('گزارش‌های پیش‌فرض قابل تغییر نیستند');
  }
  if (!ROLE_REPORT_CATALOG[roleId].includes(slug)) {
    throw new Error('این گزارش برای این نقش قابل اعطا نیست');
  }

  const { matrix, provinceIds } = mockGetReportAccessSnapshot();
  setAccess(matrix, roleId, slug, provinceIds, enabled);
  mockSaveReportAccessMatrix(matrix);
}

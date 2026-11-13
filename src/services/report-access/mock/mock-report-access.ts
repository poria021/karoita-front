import {
  buildApprovedDocument,
  normalizeMatrix,
  setAccess,
  setCompare,
} from '@/features/karvita/report-access/lib/access-matrix';
import { mockReportAccessProvinceCatalog } from '@/services/report-access/mock/mock-report-access-seed';
import type {
  ReportAccessMatrix,
  ReportAccessSnapshot,
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

  // معلم راهنما: حضور و نمرات هم اعطا شده (خارج از سند مصوب)
  setAccess(matrix, 'mentor_teacher', 'attendance', provinceIds, true);
  setAccess(matrix, 'mentor_teacher', 'scores', provinceIds, true);

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

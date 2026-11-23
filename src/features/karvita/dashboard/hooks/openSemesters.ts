import type {
  LessonReportFilter,
} from '@/services/reports/real/lesson-reports.api';
import { fetchListPage } from '@/services/reports/real/list-reports.api';
import type { ListReportSlug } from '@/services/reports/real/list-reports.api';
import type { NestSemester } from '@/types/nest-admin';
import type { ReportPeriodState, ReportRow } from '@/types/reports';

import {
  pickCurrentSemester,
  type CurrentTermKind,
} from '../lib/current-terms';
import { mergeRowsById } from '../lib/merge-rows';
import { loadAllSemesters } from './useCurrentTerms';

/**
 * «آخرین نیم‌سال باز» هر نوع (ترمی / پودمانی) برای همهٔ داده‌های میز کار.
 * همان قاعدهٔ چیپ‌های خوش‌آمد (`pickCurrentSemester`): کلاس‌های در جریان،
 * بعد انتخاب واحد باز. نوعی که نیم‌سال بازی ندارد در نتیجه نمی‌آید و
 * هیچ‌وقت به «همهٔ نیم‌سال‌ها» برنمی‌گردد.
 */
export type OpenSemester = {
  kind: CurrentTermKind;
  semester: NestSemester;
};

const KINDS: readonly CurrentTermKind[] = ['semester', 'podmani'];

/** باکس‌های میز کار هم‌زمان لود می‌شوند؛ یک بار گرفتن کافی است. */
const CACHE_MS = 30_000;
let cached: { at: number; promise: Promise<OpenSemester[]> } | null = null;

export function loadOpenSemesters(): Promise<OpenSemester[]> {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_MS) return cached.promise;
  const promise = loadAllSemesters().then((all) =>
    KINDS.flatMap((kind) => {
      const semester = pickCurrentSemester(all, kind);
      return semester ? [{ kind, semester }] : [];
    })
  );
  cached = { at: now, promise };
  promise.catch(() => {
    if (cached?.promise === promise) cached = null;
  });
  return promise;
}

/** فیلتر API درس‌ها (`semesterId` + `structure` هم‌خوان). */
export function lessonFilterFor(open: OpenSemester): LessonReportFilter {
  return { semesterId: open.semester.id, structure: open.kind };
}

/** period گزارش‌های لیستی: `module` = پودمانی، `term` = ترمی. */
export function reportPeriodFor(open: OpenSemester): ReportPeriodState {
  return {
    mode: open.kind === 'podmani' ? 'module' : 'term',
    termId: '',
    moduleId: '',
    semesterId: open.semester.id,
  };
}

const MAX_PAGES = 10;

/**
 * همهٔ صفحه‌های یک گزارش لیستی برای نیم‌سال باز هر دو نوع. ردیف یک موجودیت
 * (استان، مدرسه، …) که در هر دو نوع آمده یکی می‌شود (میانگین نمره/حضور/پاسخ).
 * بدون نیم‌سال باز: ردیفی نیست.
 */
export async function loadListRowsForOpenSemesters(
  slug: ListReportSlug
): Promise<{ rows: ReportRow[]; truncated: boolean }> {
  const open = await loadOpenSemesters();
  const parts = await Promise.all(
    open.map(async (item) => {
      const rows: ReportRow[] = [];
      let truncated = false;
      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const result = await fetchListPage(slug, {
          filters: {},
          query: '',
          period: reportPeriodFor(item),
          page,
        });
        rows.push(...result.rows);
        if (!result.hasNextPage) break;
        if (page === MAX_PAGES) truncated = true;
      }
      return { rows, truncated };
    })
  );
  return {
    rows: mergeRowsById(parts.flatMap((part) => part.rows)),
    truncated: parts.some((part) => part.truncated),
  };
}

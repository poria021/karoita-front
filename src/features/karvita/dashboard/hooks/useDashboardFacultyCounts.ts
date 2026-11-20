'use client';

import { useQuery } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { fetchLearnersPage } from '@/services/reports/real/learners-report.api';
import { fetchListPage } from '@/services/reports/real/list-reports.api';
import type { ListReportSlug } from '@/services/reports/real/list-reports.api';
import type { UserRole } from '@/types/auth';
import type { ReportPeriodState, ReportRow } from '@/types/reports';

import { facultyPerformanceQueryOptions } from './facultyPerformanceQuery';

/** لیست‌ها به semester وابسته نیستند؛ مثل بقیهٔ هوک‌های میز کار period خالی می‌رود. */
const DASHBOARD_PERIOD: ReportPeriodState = {
  mode: 'term',
  termId: '',
  moduleId: '',
};

/** هر صفحه ۵۰ ردیف؛ سقف صفحه فقط محافظ است. */
const MAX_PAGES = 10;

export type FacultyCounts = {
  professors: number;
  schools: number;
  /** فقط دانشگاه استانی: تعداد دانشکده‌ها (جای «مدارس»). */
  faculties?: number;
  learners: number;
  /** به سقف صفحه‌ها خورده؛ اعداد «دست‌کم» هستند. */
  truncated: boolean;
};

export type DashboardFacultyCountsState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  counts: FacultyCounts | null;
};

async function collectAllPages(slug: ListReportSlug): Promise<{
  rows: ReportRow[];
  truncated: boolean;
}> {
  const collected: ReportRow[] = [];
  let truncated = false;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await fetchListPage(slug, {
      filters: {},
      query: '',
      period: DASHBOARD_PERIOD,
      page,
    });
    collected.push(...result.rows);
    if (!result.hasNextPage) break;
    if (page === MAX_PAGES) truncated = true;
  }
  return { rows: collected, truncated };
}

async function collectLearnersCount(): Promise<{
  count: number;
  truncated: boolean;
}> {
  let count = 0;
  let truncated = false;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await fetchLearnersPage({
      filters: {},
      query: '',
      period: DASHBOARD_PERIOD,
      page,
    });
    count += result.rows.length;
    if (!result.hasNextPage) break;
    if (page === MAX_PAGES) truncated = true;
  }
  return { count, truncated };
}

/** جمع شمار اساتید، مدارس و فراگیران دانشکده. */
export function summarizeFacultyCounts(input: {
  professors: readonly ReportRow[];
  schools: readonly ReportRow[];
  faculties?: readonly ReportRow[];
  learners: number;
  truncated?: boolean;
}): FacultyCounts {
  return {
    professors: input.professors?.length ?? 0,
    schools: input.schools?.length ?? 0,
    faculties: input.faculties?.length,
    learners: input.learners,
    truncated: input.truncated === true,
  };
}

type FacultyCountsRest = {
  professors: { rows: ReportRow[]; truncated: boolean };
  schools: { rows: ReportRow[]; truncated: boolean };
  learners: { count: number; truncated: boolean };
};

function isFacultyCountsRest(value: unknown): value is FacultyCountsRest {
  if (!value || typeof value !== 'object') return false;
  const rec = value as Record<string, unknown>;
  const professors = rec.professors;
  const schools = rec.schools;
  const learners = rec.learners;
  return (
    !!professors &&
    typeof professors === 'object' &&
    Array.isArray((professors as { rows?: unknown }).rows) &&
    !!schools &&
    typeof schools === 'object' &&
    Array.isArray((schools as { rows?: unknown }).rows) &&
    !!learners &&
    typeof learners === 'object' &&
    typeof (learners as { count?: unknown }).count === 'number'
  );
}

/**
 * یک کوئری مشترک برای کارت‌های آمار میز کار مدیر دانشکده.
 * محدودهٔ داده را خود بک‌اند از روی کاربر لاگین‌شده تعیین می‌کند.
 * دانشگاه استانی: دانشکده‌ها / اساتید / فراگیران (به‌جای اساتید / فراگیران / مدارس).
 * شمار دانشکده‌ها از همان کوئری مشترک `faculties/performance` می‌آید (نه fetch جدا).
 */
export function useDashboardFacultyCounts(
  role?: UserRole
): DashboardFacultyCountsState {
  const provincial = role === 'provincial_university';

  const performanceQuery = useQuery({
    ...facultyPerformanceQueryOptions('faculty-performance'),
    enabled: provincial,
  });

  const restQuery = useQuery({
    // `rest-v2`: شکل داده عوض شده؛ کش قدیمی FacultyCounts تخت را نخوریم.
    queryKey: [
      ...DASHBOARD_QUERY.facultyCounts,
      'rest-v2',
      provincial ? 'provincial' : 'faculty',
    ],
    staleTime: QUERY_STALE_MS.module,
    queryFn: async (): Promise<FacultyCountsRest> => {
      const empty = { rows: [] as ReportRow[], truncated: false };
      const [professors, schools, learners] = await Promise.all([
        collectAllPages('professors'),
        provincial ? Promise.resolve(empty) : collectAllPages('school-performance'),
        collectLearnersCount(),
      ]);
      return { professors, schools, learners };
    },
  });

  const rest = isFacultyCountsRest(restQuery.data) ? restQuery.data : null;

  const isLoading =
    (restQuery.isPending && !rest) ||
    (provincial && performanceQuery.isPending && !performanceQuery.data);
  const isError =
    (restQuery.isError && !rest) ||
    (provincial && performanceQuery.isError && !performanceQuery.data);
  const isForbidden =
    isForbiddenError(restQuery.error) ||
    (provincial && isForbiddenError(performanceQuery.error));

  let counts: FacultyCounts | null = null;
  if (rest && (!provincial || performanceQuery.data)) {
    counts = summarizeFacultyCounts({
      professors: rest.professors.rows,
      schools: rest.schools.rows,
      faculties: provincial ? performanceQuery.data?.rows : undefined,
      learners: rest.learners.count,
      truncated:
        rest.professors.truncated ||
        rest.schools.truncated ||
        rest.learners.truncated ||
        (provincial && performanceQuery.data?.truncated === true),
    });
  }

  return {
    isLoading,
    isError,
    isForbidden,
    counts,
  };
}

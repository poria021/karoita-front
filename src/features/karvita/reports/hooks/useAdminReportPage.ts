'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  COMPARE_MAX,
  COMPARE_MIN,
  COMPARE_REPORT_SLUGS,
  CUR_PERIOD,
  REPORT_LIST_LIMIT,
  REPORT_PAGE_DEFS,
} from '@/features/karvita/reports/constants';
import { ReportsService } from '@/services/reports.service';
import type { ReportSlug } from '@/types/report-access';
import type {
  ReportColumnDef,
  ReportCompareItem,
  ReportFilterKey,
  ReportFilters,
  ReportLearnerCourseDetail,
  ReportLearnerScoreDetail,
  ReportOption,
  ReportPeriodState,
  ReportRow,
  ReportSort,
} from '@/types/reports';

function hasPeriod(def: (typeof REPORT_PAGE_DEFS)[ReportSlug]): boolean {
  return Boolean(def.learner || def.period);
}

function advKeysOf(slug: ReportSlug): ReportFilterKey[] {
  const def = REPORT_PAGE_DEFS[slug];
  const keys = [...def.first, ...def.more].filter(
    (k): k is ReportFilterKey =>
      k !== 'q' && k !== 'period' && k !== 'view'
  );
  return keys;
}

export type UseAdminReportPageOptions = {
  /** اگر ست شود، جایگزین پیش‌فرض «اسلاگ مقایسه‌پذیر» می‌شود (ماتریس دسترسی سازمانی). */
  canCompare?: boolean;
};

export function useAdminReportPage(
  slug: ReportSlug,
  options?: UseAdminReportPageOptions
) {
  const def = REPORT_PAGE_DEFS[slug];
  const [period, setPeriod] = useState<ReportPeriodState>({
    mode: 'term',
    termId: CUR_PERIOD.term,
    moduleId: CUR_PERIOD.module,
  });
  const [filters, setFilters] = useState<ReportFilters>({});
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<ReportSort | null>(null);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [columns, setColumns] = useState<ReportColumnDef[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<
    Partial<Record<ReportFilterKey, ReportOption[]>>
  >({});
  const [courseLabels, setCourseLabels] = useState<Record<string, string>>(
    {}
  );
  const [advOpen, setAdvOpen] = useState(false);

  const [dialog, setDialog] = useState<
    | { type: 'courses'; learnerId: string }
    | { type: 'scores'; learnerId: string }
    | null
  >(null);
  const [courseDetail, setCourseDetail] =
    useState<ReportLearnerCourseDetail | null>(null);
  const [scoreDetail, setScoreDetail] =
    useState<ReportLearnerScoreDetail | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  const canCompare =
    options?.canCompare ?? COMPARE_REPORT_SLUGS.includes(slug);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelected, setCompareSelected] = useState<string[]>([]);
  const [compareDraft, setCompareDraft] = useState<string[]>([]);
  const [compareItems, setCompareItems] = useState<ReportCompareItem[]>([]);
  const [compareQ, setCompareQ] = useState('');
  const [compareCandidates, setCompareCandidates] = useState<ReportRow[]>([]);

  useEffect(() => {
    if (canCompare) return;
    setCompareMode(false);
    setCompareSelected([]);
    setCompareDraft([]);
  }, [canCompare]);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await ReportsService.queryReport({
        slug,
        filters,
        query,
        period,
        sort,
        page: 1,
        pageSize: REPORT_LIST_LIMIT,
      });
      setRows(result.rows);
      setColumns(result.columns);
      setTotal(result.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'بارگذاری گزارش ناموفق بود.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [slug, filters, query, period, sort]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    setFilters({});
    setQuery('');
    setSort(null);
    setCompareMode(false);
    setCompareSelected([]);
    setCompareDraft([]);
    setCompareItems([]);
    setDialog(null);
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    void ReportsService.getFilterCatalog().then((catalog) => {
      if (cancelled) return;
      const labels: Record<string, string> = {};
      for (const c of catalog.courses) labels[c.value] = c.label;
      setCourseLabels(labels);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const keys = advKeysOf(slug);
    void Promise.all(
      keys.map(async (key) => {
        const opts = await ReportsService.getFilterOptions(key, filters, slug);
        return [key, opts] as const;
      })
    ).then((entries) => {
      if (cancelled) return;
      const next: Partial<Record<ReportFilterKey, ReportOption[]>> = {};
      for (const [key, opts] of entries) next[key] = opts;
      setFilterOptions(next);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, filters]);

  useEffect(() => {
    if (!dialog) {
      setCourseDetail(null);
      setScoreDetail(null);
      return;
    }
    let cancelled = false;
    setDialogLoading(true);
    const run = async () => {
      try {
        if (dialog.type === 'courses') {
          const detail = await ReportsService.getLearnerCourseDetails(
            dialog.learnerId,
            period
          );
          if (!cancelled) setCourseDetail(detail);
        } else {
          const detail = await ReportsService.getLearnerScoreDetails(
            dialog.learnerId,
            period
          );
          if (!cancelled) setScoreDetail(detail);
        }
      } finally {
        if (!cancelled) setDialogLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [dialog, period]);

  const activeAdvCount = useMemo(
    () => advKeysOf(slug).filter((k) => Boolean(filters[k])).length,
    [slug, filters]
  );

  const anyFilterActive = Boolean(query) || activeAdvCount > 0;

  const setFilter = useCallback((key: ReportFilterKey, value: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (!value) delete next[key];
      else next[key] = value;
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setQuery('');
  }, []);

  const toggleSort = useCallback((colId: string) => {
    setSort((prev) => {
      if (!prev || prev.id !== colId) return { id: colId, dir: 'asc' };
      if (prev.dir === 'asc') return { id: colId, dir: 'desc' };
      return null;
    });
  }, []);

  const setMode = useCallback((mode: 'term' | 'module') => {
    setPeriod((p) => ({ ...p, mode }));
  }, []);

  const setPeriodId = useCallback((id: string) => {
    setPeriod((p) =>
      p.mode === 'term' ? { ...p, termId: id } : { ...p, moduleId: id }
    );
  }, []);

  const exportStub = useCallback((format: 'PDF' | 'اکسل') => {
    toast.message(`فایل ${format} آماده شد`);
  }, []);

  const toggleCompareSelect = useCallback((id: string) => {
    setCompareSelected((prev) => {
      const i = prev.indexOf(id);
      if (i >= 0) return prev.filter((x) => x !== id);
      if (prev.length >= COMPARE_MAX) return prev;
      return [...prev, id];
    });
  }, []);

  const clearCompareSelected = useCallback(() => {
    setCompareSelected([]);
  }, []);

  const clearCompareDraft = useCallback(() => {
    setCompareDraft([]);
  }, []);

  const enterCompare = useCallback(async () => {
    if (!canCompare) return;
    setCompareMode(true);
    setCompareDraft(compareSelected.slice());
    setCompareQ('');
    try {
      const all = await ReportsService.queryReport({
        slug,
        filters,
        query: '',
        period,
        sort: null,
        page: 1,
        pageSize: REPORT_LIST_LIMIT,
      });
      setCompareCandidates(all.rows);
      if (compareSelected.length >= COMPARE_MIN) {
        const items = await ReportsService.getCompareItems(
          slug,
          compareSelected,
          period
        );
        setCompareItems(items);
      } else {
        setCompareItems([]);
      }
    } catch {
      setCompareCandidates([]);
    }
  }, [canCompare, compareSelected, filters, period, slug]);

  const exitCompare = useCallback(() => {
    setCompareMode(false);
    setCompareDraft([]);
    setCompareQ('');
  }, []);

  const toggleCompareDraft = useCallback((id: string, on: boolean) => {
    setCompareDraft((prev) => {
      const i = prev.indexOf(id);
      if (on) {
        if (i >= 0) return prev;
        if (prev.length >= COMPARE_MAX) return prev;
        return [...prev, id];
      }
      if (i < 0) return prev;
      return prev.filter((x) => x !== id);
    });
  }, []);

  const confirmCompare = useCallback(async () => {
    if (compareDraft.length < COMPARE_MIN) return;
    setCompareSelected(compareDraft.slice());
    const items = await ReportsService.getCompareItems(
      slug,
      compareDraft,
      period
    );
    setCompareItems(items);
  }, [compareDraft, period, slug]);

  const exportCompareStub = useCallback((format: 'PDF' | 'اکسل') => {
    toast.message(`فایل ${format} مقایسه آماده شد`);
  }, []);

  return {
    slug,
    def,
    showPeriod: hasPeriod(def),
    period,
    setMode,
    setPeriodId,
    filters,
    setFilter,
    query,
    setQuery,
    sort,
    toggleSort,
    rows,
    columns,
    total,
    isLoading,
    error,
    reload,
    filterOptions,
    courseLabels,
    advKeys: advKeysOf(slug),
    advOpen,
    setAdvOpen,
    activeAdvCount,
    anyFilterActive,
    clearFilters,
    exportStub,
    dialog,
    openCourses: (learnerId: string) =>
      setDialog({ type: 'courses', learnerId }),
    openScores: (learnerId: string) => setDialog({ type: 'scores', learnerId }),
    closeDialog: () => setDialog(null),
    courseDetail,
    scoreDetail,
    dialogLoading,
    canCompare,
    compareMode,
    compareSelected,
    compareDraft,
    compareItems,
    compareQ,
    setCompareQ,
    compareCandidates,
    toggleCompareSelect,
    clearCompareSelected,
    clearCompareDraft,
    enterCompare,
    exitCompare,
    toggleCompareDraft,
    confirmCompare,
    exportCompareStub,
    compareMin: COMPARE_MIN,
    compareMax: COMPARE_MAX,
  };
}

export type AdminReportPageModel = ReturnType<typeof useAdminReportPage>;

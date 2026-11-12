'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

import {
  COMPARE_MAX,
  COMPARE_MIN,
  COMPARE_REPORT_SLUGS,
  CUR_PERIOD,
  REPORT_LIST_LIMIT,
  REPORT_PAGE_DEFS,
} from '@/features/karvita/reports/constants';
import {
  isReportCompareView,
  parseReportCompareIds,
  REPORT_COMPARE_IDS_PARAM,
  REPORT_PERIOD_MODE_PARAM,
  REPORT_PERIOD_MODE_VALUES,
  REPORT_VIEW_COMPARE,
  REPORT_VIEW_PARAM,
  serializeReportCompareIds,
} from '@/features/karvita/reports/lib/report-compare-url';
import { useSyncedUrlParam } from '@/hooks/useSyncedUrlParam';
import { hrefWithSearchParam } from '@/lib/dashboard-url-state';
import {
  getShallowLocationSearch,
  getShallowLocationSearchServerSnapshot,
  replaceShallowHref,
  subscribeShallowLocation,
} from '@/lib/shallow-location';
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
  ReportPeriodMode,
  ReportPeriodState,
  ReportRow,
  ReportSort,
} from '@/types/reports';

function hasPeriod(def: (typeof REPORT_PAGE_DEFS)[ReportSlug]): boolean {
  return Boolean(def.learner || def.period);
}

const NO_HIDDEN_FILTER_KEYS: readonly ReportFilterKey[] = [];
const NO_EXTRA_FILTER_KEYS: readonly ReportFilterKey[] = [];

/** ترتیب نمایش کشوی فیلتر: دانشکده پایین استان و بالای مدرسه. */
const ADV_FILTER_DISPLAY_ORDER: readonly ReportFilterKey[] = [
  'province',
  'city',
  'region',
  'faculty',
  'school',
  'professor',
  'teacher',
  'major',
  'course',
  'status',
];

const ADV_FILTER_RANK = new Map(
  ADV_FILTER_DISPLAY_ORDER.map((key, index) => [key, index])
);

function sortAdvFilterKeys(keys: ReportFilterKey[]): ReportFilterKey[] {
  return [...keys].sort((a, b) => {
    const rankA = ADV_FILTER_RANK.get(a) ?? ADV_FILTER_DISPLAY_ORDER.length;
    const rankB = ADV_FILTER_RANK.get(b) ?? ADV_FILTER_DISPLAY_ORDER.length;
    return rankA - rankB;
  });
}

function advKeysOf(
  slug: ReportSlug,
  hidden: readonly ReportFilterKey[] = NO_HIDDEN_FILTER_KEYS,
  extra: readonly ReportFilterKey[] = NO_EXTRA_FILTER_KEYS
): ReportFilterKey[] {
  const def = REPORT_PAGE_DEFS[slug];
  const hiddenSet = new Set(hidden);
  const keys = [...def.first, ...def.more].filter(
    (k): k is ReportFilterKey =>
      k !== 'q' &&
      k !== 'period' &&
      k !== 'view' &&
      !hiddenSet.has(k as ReportFilterKey)
  );
  for (const key of extra) {
    if (!hiddenSet.has(key) && !keys.includes(key)) keys.push(key);
  }
  return sortAdvFilterKeys(keys);
}

export type UseAdminReportPageOptions = {
  /** اگر ست شود، جایگزین پیش‌فرض «اسلاگ مقایسه‌پذیر» می‌شود (ماتریس دسترسی سازمانی). */
  canCompare?: boolean;
  /** فیلترهایی که برای نقش فعلی در UI گزارش مخفی‌اند. */
  hiddenFilterKeys?: readonly ReportFilterKey[];
  /** فیلترهای اضافه‌ای که برای نقش روی این اسلاگ باید دیده شوند. */
  extraFilterKeys?: readonly ReportFilterKey[];
};

export function useAdminReportPage(
  slug: ReportSlug,
  options?: UseAdminReportPageOptions
) {
  const def = REPORT_PAGE_DEFS[slug];
  const hiddenFilterKeys =
    options?.hiddenFilterKeys ?? NO_HIDDEN_FILTER_KEYS;
  const extraFilterKeys = options?.extraFilterKeys ?? NO_EXTRA_FILTER_KEYS;
  const [periodMode, setPeriodMode] = useSyncedUrlParam<ReportPeriodMode>({
    name: REPORT_PERIOD_MODE_PARAM,
    allowed: REPORT_PERIOD_MODE_VALUES,
    defaultValue: 'term',
  });
  const [periodIds, setPeriodIds] = useState<{
    termId: string;
    moduleId: string;
  }>({
    termId: CUR_PERIOD.term,
    moduleId: CUR_PERIOD.module,
  });
  const period: ReportPeriodState = useMemo(
    () => ({
      mode: periodMode,
      termId: periodIds.termId,
      moduleId: periodIds.moduleId,
    }),
    [periodIds.moduleId, periodIds.termId, periodMode]
  );
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
  const pathname = usePathname();
  const locationSearch = useSyncExternalStore(
    subscribeShallowLocation,
    getShallowLocationSearch,
    getShallowLocationSearchServerSnapshot
  );
  const searchParams = useMemo(() => {
    const raw = locationSearch.startsWith('?')
      ? locationSearch.slice(1)
      : locationSearch;
    return new URLSearchParams(raw);
  }, [locationSearch]);
  const compareModeActive =
    canCompare && isReportCompareView(searchParams.get(REPORT_VIEW_PARAM));

  const setCompareModeInUrl = useCallback(
    (on: boolean) => {
      if (typeof window === 'undefined') return;
      if (window.location.pathname !== pathname) return;
      // search زنده — وابسته به snapshot نباشد تا عوض‌شدن ?view هویت callback را نشکند.
      const live = new URLSearchParams(window.location.search);
      const next = hrefWithSearchParam(
        pathname,
        live,
        REPORT_VIEW_PARAM,
        on ? REPORT_VIEW_COMPARE : null
      );
      replaceShallowHref(next);
    },
    [pathname]
  );

  const setCompareIdsInUrl = useCallback(
    (ids: readonly string[]) => {
      if (typeof window === 'undefined') return;
      if (window.location.pathname !== pathname) return;
      const live = new URLSearchParams(window.location.search);
      const next = hrefWithSearchParam(
        pathname,
        live,
        REPORT_COMPARE_IDS_PARAM,
        serializeReportCompareIds(ids)
      );
      replaceShallowHref(next);
    },
    [pathname]
  );

  const compareIdsFromUrl = useMemo(
    () =>
      parseReportCompareIds(
        searchParams.get(REPORT_COMPARE_IDS_PARAM),
        COMPARE_MAX
      ),
    [searchParams]
  );

  const [compareSelected, setCompareSelected] = useState<string[]>([]);
  const [compareDraft, setCompareDraft] = useState<string[]>([]);
  const [compareItems, setCompareItems] = useState<ReportCompareItem[]>([]);
  const [compareQ, setCompareQ] = useState('');
  const [compareCandidates, setCompareCandidates] = useState<ReportRow[]>([]);
  const skipCompareResetOnMountRef = useRef(true);
  const compareHydratedRef = useRef(false);
  const skipDraftUrlSyncRef = useRef(false);

  // واکشی گزارش/فیلتر/دیالوگ — state محلی بعد از resolve سرویس؛ مشتق‌پذیر از props نیست.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setFilters((prev) => (Object.keys(prev).length === 0 ? prev : {}));
    setQuery((q) => (q === '' ? q : ''));
    setSort((s) => (s == null ? s : null));
    setRows([]);
    setColumns(ReportsService.getColumnDefs(slug));
    setTotal(0);
    setIsLoading(true);
    setError(null);
    setCompareSelected([]);
    setCompareDraft([]);
    setCompareItems([]);
    setDialog(null);
    setAdvOpen(false);
    compareHydratedRef.current = false;
    skipDraftUrlSyncRef.current = false;
    // روی mount اول، ?view=compare را برای دیپ‌لینک نگه دار؛ فقط با تعویض اسلاگ پاک کن.
    if (skipCompareResetOnMountRef.current) {
      skipCompareResetOnMountRef.current = false;
    } else {
      setCompareModeInUrl(false);
      setCompareIdsInUrl([]);
    }
  }, [setCompareIdsInUrl, setCompareModeInUrl, slug]);

  // رفرش با ?view=compare&cmp=… — انتخاب و گزارش را از URL برگردان.
  useEffect(() => {
    if (!canCompare || !compareModeActive || compareHydratedRef.current) return;
    compareHydratedRef.current = true;
    if (compareIdsFromUrl.length === 0) return;
    // یک دور sync را رد کن تا draft خالیِ قبل از hydrate، ?cmp را پاک نکند.
    skipDraftUrlSyncRef.current = true;
    setCompareSelected(compareIdsFromUrl);
    setCompareDraft(compareIdsFromUrl);
  }, [canCompare, compareIdsFromUrl, compareModeActive]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    void (async () => {
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
        if (cancelled) return;
        setRows(result.rows);
        setColumns(result.columns);
        setTotal(result.total);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : 'بارگذاری گزارش ناموفق بود.'
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, filters, query, period, sort]);

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

  const advKeys = useMemo(
    () => advKeysOf(slug, hiddenFilterKeys, extraFilterKeys),
    [slug, hiddenFilterKeys, extraFilterKeys]
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.all(
      advKeys.map(async (key) => {
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
  }, [slug, filters, advKeys]);

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
  /* eslint-enable react-hooks/set-state-in-effect */

  const activeAdvCount = useMemo(
    () => advKeys.filter((k) => Boolean(filters[k])).length,
    [advKeys, filters]
  );

  const anyFilterActive = Boolean(query) || activeAdvCount > 0;

  const setFilter = useCallback((key: ReportFilterKey, value: string) => {
    setFilters((prev) => {
      if (!value) {
        if (prev[key] === undefined) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      }
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters((prev) => (Object.keys(prev).length === 0 ? prev : {}));
    setQuery((q) => (q === '' ? q : ''));
  }, []);

  const toggleSort = useCallback((colId: string) => {
    setSort((prev) => {
      if (!prev || prev.id !== colId) return { id: colId, dir: 'asc' };
      if (prev.dir === 'asc') return { id: colId, dir: 'desc' };
      return null;
    });
  }, []);

  const setMode = useCallback(
    (mode: ReportPeriodMode) => {
      setPeriodMode(mode);
    },
    [setPeriodMode]
  );

  const setPeriodId = useCallback(
    (id: string) => {
      setPeriodIds((prev) =>
        periodMode === 'term'
          ? { ...prev, termId: id }
          : { ...prev, moduleId: id }
      );
    },
    [periodMode]
  );

  const exportStub = useCallback((format: 'PDF' | 'اکسل') => {
    toast.message(`فایل ${format} آماده شد`);
  }, []);

  const toggleCompareSelect = useCallback(
    (id: string) => {
      setCompareSelected((prev) => {
        const i = prev.indexOf(id);
        const next =
          i >= 0
            ? prev.filter((x) => x !== id)
            : prev.length >= COMPARE_MAX
              ? prev
              : [...prev, id];
        if (next !== prev) {
          queueMicrotask(() => setCompareIdsInUrl(next));
        }
        return next;
      });
    },
    [setCompareIdsInUrl]
  );

  const clearCompareSelected = useCallback(() => {
    setCompareSelected([]);
    setCompareIdsInUrl([]);
  }, [setCompareIdsInUrl]);

  const clearCompareDraft = useCallback(() => {
    setCompareDraft([]);
  }, []);

  const setCompareDraftIds = useCallback((ids: string[]) => {
    const seen = new Set<string>();
    const next: string[] = [];
    for (const id of ids) {
      if (!id || seen.has(id)) continue;
      seen.add(id);
      next.push(id);
      if (next.length >= COMPARE_MAX) break;
    }
    setCompareDraft(next);
  }, []);

  const enterCompare = useCallback(() => {
    if (!canCompare) return;
    const ids = compareSelected.slice();
    setCompareDraft(ids);
    setCompareQ('');
    setCompareModeInUrl(true);
    setCompareIdsInUrl(ids);
  }, [canCompare, compareSelected, setCompareIdsInUrl, setCompareModeInUrl]);

  const exitCompare = useCallback(() => {
    setCompareModeInUrl(false);
    setCompareDraft([]);
    setCompareQ('');
    compareHydratedRef.current = false;
    // cmp را نگه می‌داریم تا انتخاب لیست بعد از خروج از مقایسه زنده بماند.
  }, [setCompareModeInUrl]);

  // در حالت مقایسه، پیش‌نویس را در ?cmp آینه کن تا رفرش داده را نگه دارد.
  useEffect(() => {
    if (!canCompare || !compareModeActive || !compareHydratedRef.current) return;
    if (skipDraftUrlSyncRef.current) {
      skipDraftUrlSyncRef.current = false;
      return;
    }
    setCompareIdsInUrl(compareDraft);
  }, [
    canCompare,
    compareDraft,
    compareModeActive,
    setCompareIdsInUrl,
  ]);

  // `?view=compare` روی مسیر همان گزارش؛ دیپ‌لینک و ورود از دکمهٔ مقایسه.
  useEffect(() => {
    if (!canCompare) {
      if (
        typeof window !== 'undefined' &&
        isReportCompareView(
          new URLSearchParams(window.location.search).get(REPORT_VIEW_PARAM)
        )
      ) {
        setCompareModeInUrl(false);
      }
      return;
    }
    if (!compareModeActive) return;

    let cancelled = false;
    setCompareDraft((prev) => (prev.length ? prev : compareSelected.slice()));

    void (async () => {
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
        if (cancelled) return;
        setCompareCandidates(all.rows);
        if (compareSelected.length >= COMPARE_MIN) {
          const items = await ReportsService.getCompareItems(
            slug,
            compareSelected,
            period
          );
          if (!cancelled) setCompareItems(items);
        } else if (!cancelled) {
          setCompareItems([]);
        }
      } catch {
        if (!cancelled) {
          setCompareCandidates([]);
          setCompareItems([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    canCompare,
    compareModeActive,
    compareSelected,
    filters,
    period,
    setCompareModeInUrl,
    slug,
  ]);

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
    const ids = compareDraft.slice();
    setCompareSelected(ids);
    setCompareIdsInUrl(ids);
    const items = await ReportsService.getCompareItems(slug, ids, period);
    setCompareItems(items);
  }, [compareDraft, period, setCompareIdsInUrl, slug]);

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
    advKeys,
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
    compareMode: compareModeActive,
    compareSelected,
    compareDraft,
    compareItems,
    compareQ,
    setCompareQ,
    compareCandidates,
    toggleCompareSelect,
    clearCompareSelected,
    clearCompareDraft,
    setCompareDraftIds,
    enterCompare,
    exitCompare,
    toggleCompareDraft,
    confirmCompare,
    compareMin: COMPARE_MIN,
    compareMax: COMPARE_MAX,
  };
}

export type AdminReportPageModel = ReturnType<typeof useAdminReportPage>;

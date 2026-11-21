'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
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
  REPORT_COMPARE_ENABLED,
  REPORT_LIST_LIMIT,
  REPORT_PAGE_DEFS,
} from '@/features/karvita/reports/constants';
import {
  hrefWithoutDisabledReportCompare,
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
  replaceShallowHref,
  subscribeShallowLocation,
} from '@/lib/shallow-location';
import {
  isRealApiReport,
  isRealLearnersReport,
  ReportsService,
  sortLoadedRows,
} from '@/services/reports.service';
import {
  learnersDescendantKeys,
  learnersGradesDescendantKeys,
  type LearnersFilterBox,
  withRowStatusFallback,
} from '@/services/reports/real/learners-report.api';
import { fetchReportPeriods } from '@/services/reports/real/report-periods.api';
import {
  isPerformanceReportSlug,
  performanceSortParams,
} from '@/services/reports/real/performance-report.mappers';
import {
  isListReportSlug,
  listReportDescendantKeys,
} from '@/services/reports/real/list-reports.api';
import { useUserStore } from '@/store/useUserStore';
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

/** مسیر + query زندهٔ مرورگر (سمت سرور خالی). */
function getLocationSnapshot(): string {
  return `${window.location.pathname}${window.location.search}`;
}

function getLocationServerSnapshot(): string {
  return '';
}

/** ستون‌های عددی؛ مرتب‌سازی پیش‌فرض روی اولین ستون عددی هر گزارش است. */
const NUMERIC_COLUMN_KINDS: ReadonlySet<string> = new Set([
  'percent',
  'score',
  'count',
]);

/**
 * مرتب‌سازی پیش‌فرض: بیشترین → کمترین.
 * - گزارش‌های عملکرد: اولین ستونی که Nest (`sortBy`/`sortOrder`) می‌پذیرد؛ sort سمت API.
 * - بقیه: Nest `sortBy` ندارد؛ روی اولین ستون عددی، سمت کلاینت (`sortLoadedRows`).
 * - گزارش‌های بدون ستون عددی (فراگیران، نمرات، مدیران مدرسه): ترتیب پاسخ API حفظ می‌شود.
 */
function defaultReportSort(slug: ReportSlug): ReportSort | null {
  const columns = ReportsService.getColumnDefs(slug);
  if (isPerformanceReportSlug(slug)) {
    for (const col of columns) {
      if (col.nosort) continue;
      const probe: ReportSort = { id: col.id, dir: 'desc' };
      if (performanceSortParams(slug, probe).sortBy) return probe;
    }
    return null;
  }
  const numeric = columns.find(
    (col) => !col.nosort && NUMERIC_COLUMN_KINDS.has(col.kind)
  );
  return numeric ? { id: numeric.id, dir: 'desc' } : null;
}

function hasPeriod(def: (typeof REPORT_PAGE_DEFS)[ReportSlug]): boolean {
  return Boolean(def.learner || def.period);
}

/** کلیدهای آبشار برای هر اسلاگ real — «فراگیران» جدا، بقیه از `list-reports.api`. */
function descendantKeysFor(slug: ReportSlug, key: ReportFilterKey): ReportFilterKey[] {
  // «حضور و غیاب فراگیران» همان آبشار «لیست فراگیران» را دارد.
  if (slug === 'learners' || slug === 'attendance') {
    return learnersDescendantKeys(key);
  }
  if (slug === 'scores') return learnersGradesDescendantKeys(key);
  if (isListReportSlug(slug)) return listReportDescendantKeys(slug, key);
  return [];
}

const NO_HIDDEN_FILTER_KEYS: readonly ReportFilterKey[] = [];
const NO_EXTRA_FILTER_KEYS: readonly ReportFilterKey[] = [];

/** مدت اعتبار نتیجهٔ جدول در حافظه؛ برگشت به تب/ترکیب قبلی در این مدت بدون درخواست جدید است. */
const REPORT_CACHE_TTL_MS = 5 * 60 * 1000;

type CachedReportPage = {
  at: number;
  rows: ReportRow[];
  columns: ReportColumnDef[];
  total: number;
  hasNextPage: boolean;
  pageNo: number;
};

type CachedFilterBoxes = {
  at: number;
  entries: (readonly [ReportFilterKey, LearnersFilterBox])[];
};

/**
 * کش‌ها عمداً module-level‌اند (نه ref داخل هوک)؛ وگرنه با رفتن به گزارش دیگر هوک unmount
 * می‌شود و برگشت به گزارش قبلی دوباره API می‌زند. کلید همه شامل id کاربر است تا داده‌ٔ
 * نقش‌های مختلف قاطی نشود.
 */
const reportPageCache = new Map<string, CachedReportPage>();
const periodOptionsCache = new Map<string, ReportOption[]>();
const filterBoxesCache = new Map<string, CachedFilterBoxes>();
/** درخواست در حال اجرا — Strict Mode / effect دوبار نباید دو GET موازی بزند. */
const reportPageInflight = new Map<string, Promise<CachedReportPage>>();
const filterBoxesInflight = new Map<
  string,
  Promise<(readonly [ReportFilterKey, LearnersFilterBox])[]>
>();
const REPORT_CACHE_MAX_ENTRIES = 200;

function cacheSet<T>(map: Map<string, T>, key: string, value: T): void {
  if (!map.has(key) && map.size >= REPORT_CACHE_MAX_ENTRIES) {
    const oldest = map.keys().next().value;
    if (oldest !== undefined) map.delete(oldest);
  }
  map.set(key, value);
}

function nextFilters(
  prev: ReportFilters,
  key: ReportFilterKey,
  value: string,
  dependents: readonly ReportFilterKey[]
): ReportFilters {
  if ((prev[key] ?? '') === value) return prev;
  const next = { ...prev };
  if (value) next[key] = value;
  else delete next[key];
  // آبشار: انتخاب باکس‌های بعدی با والد جدید نمی‌خواند؛ پاک شوند.
  for (const dep of dependents) delete next[dep];
  return next;
}

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
  /** لیست فراگیران در حالت real به Nest وصل است (دیالوگ درس/نمره فقط همین‌جا معنی دارد). */
  const realLearners = isRealLearnersReport(slug);
  /** هر گزارش real (فراگیران یا یکی از گزارش‌های لیستی) — آبشار، صفحه‌بندی، خروجی. */
  const isRealApi = isRealApiReport(slug);
  const hiddenFilterKeys =
    options?.hiddenFilterKeys ?? NO_HIDDEN_FILTER_KEYS;
  const extraFilterKeys = options?.extraFilterKeys ?? NO_EXTRA_FILTER_KEYS;
  const [periodMode, setPeriodMode] = useSyncedUrlParam<ReportPeriodMode>({
    name: REPORT_PERIOD_MODE_PARAM,
    allowed: REPORT_PERIOD_MODE_VALUES,
    defaultValue: 'term',
  });
  /** دورهٔ واقعی (id نیم‌سال/پودمان از API)؛ خالی یعنی «همه» و structure/semesterId فرستاده نمی‌شود. */
  const [semesterId, setSemesterId] = useState('');
  const [periodOptions, setPeriodOptions] = useState<ReportOption[]>([]);
  const period: ReportPeriodState = useMemo(
    () => ({
      mode: periodMode,
      termId: '',
      moduleId: '',
      ...(semesterId ? { semesterId } : {}),
    }),
    [periodMode, semesterId]
  );
  /** فیلترهای اعمال‌شده روی جدول/خروجی/کش. */
  const [filters, setFilters] = useState<ReportFilters>({});
  /** پیش‌نویس کشوی پیشرفته؛ فقط با «تأیید و اعمال» به `filters` (و جدول) می‌رسد، ولی آبشار باکس‌ها از آن ساخته می‌شود. */
  const [draftFilters, setDraftFilters] = useState<ReportFilters>({});
  const [query, setQuery] = useState('');
  /** جستجوی جدول با تأخیر؛ هر کلید یک درخواست نزند. پاک‌کردن فوری اعمال می‌شود. */
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sort, setSort] = useState<ReportSort | null>(() =>
    defaultReportSort(slug)
  );
  /** کلید کش شامل کاربر است؛ با عوض‌شدن کاربر/نقش داده‌ٔ دیگری نمایش داده نمی‌شود. */
  const cacheUserId = useUserStore((state) => state.activeUser?.id ?? '');
  /** کلید نتیجهٔ جدول: کاربر/slug/نظام/دوره/فیلتر/جستجو/مرتب‌سازی. */
  const reportCacheKey = useMemo(
    () =>
      JSON.stringify([
        cacheUserId,
        slug,
        period.mode,
        period.semesterId ?? '',
        filters,
        debouncedQuery,
        sort,
      ]),
    [
      cacheUserId,
      slug,
      period.mode,
      period.semesterId,
      filters,
      debouncedQuery,
      sort,
    ]
  );
  /** اگر گزارش قبلاً دیده شده، اولین رندر با همان داده شروع شود (بدون فلش اسکلتون). */
  const [initialPage] = useState<CachedReportPage | null>(() => {
    const hit = reportPageCache.get(reportCacheKey);
    return hit && Date.now() - hit.at < REPORT_CACHE_TTL_MS ? hit : null;
  });
  const [rows, setRows] = useState<ReportRow[]>(initialPage?.rows ?? []);
  const [columns, setColumns] = useState<ReportColumnDef[]>(
    initialPage?.columns ?? []
  );
  const [total, setTotal] = useState(initialPage?.total ?? 0);
  const [isLoading, setIsLoading] = useState(!initialPage);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<
    Partial<Record<ReportFilterKey, ReportOption[]>>
  >({});
  const [advOpen, setAdvOpenState] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(
    initialPage?.hasNextPage ?? false
  );
  const [pageNo, setPageNo] = useState(initialPage?.pageNo ?? 1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  /** باکس‌هایی که Nest برای نقش فعلی نداده؛ مخفی می‌شوند. */
  const [roleHiddenKeys, setRoleHiddenKeys] = useState<ReportFilterKey[]>([]);
  /** جستجوی داخل باکس: فقط همان باکس دوباره گرفته می‌شود. */
  const [filterBoxLoading, setFilterBoxLoading] = useState<
    Partial<Record<ReportFilterKey, boolean>>
  >({});
  const boxSearchSeqRef = useRef<Partial<Record<ReportFilterKey, number>>>({});
  const boxSearchTimerRef = useRef<
    Partial<Record<ReportFilterKey, ReturnType<typeof setTimeout>>>
  >({});
  const boxSearchActiveRef = useRef<Partial<Record<ReportFilterKey, boolean>>>(
    {}
  );

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
  /** نام فراگیر برای عنوان دیالوگ ریز نمرات بدون واکشی دوباره با هر تغییر ردیف‌ها. */
  const rowsRef = useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  useEffect(() => {
    if (query === '') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDebouncedQuery('');
      return;
    }
    const timer = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  // مقایسه API جدا ندارد؛ از همان ردیف‌هایی که جدول گرفته ساخته می‌شود.
  // ماتریس دسترسی سازمانی (options.canCompare) اولویت دارد، وگرنه اسلاگ مقایسه‌پذیر.
  const canCompare =
    options?.canCompare ??
    (REPORT_COMPARE_ENABLED && COMPARE_REPORT_SLUGS.includes(slug));
  const pathname = usePathname();
  const locationSnapshot = useSyncExternalStore(
    subscribeShallowLocation,
    getLocationSnapshot,
    getLocationServerSnapshot
  );
  // هنگام ناوبری Next گزارش جدید را رندر می‌کند قبل از اینکه آدرس مرورگر عوض شود؛
  // در آن لحظه ?view=compare&cmp=… هنوز مال گزارش قبلی است و نباید به این گزارش نشت کند.
  const locationSearch = useMemo(() => {
    const queryAt = locationSnapshot.indexOf('?');
    const snapshotPath =
      queryAt === -1 ? locationSnapshot : locationSnapshot.slice(0, queryAt);
    if (snapshotPath !== pathname) return '';
    return queryAt === -1 ? '' : locationSnapshot.slice(queryAt);
  }, [locationSnapshot, pathname]);
  const searchParams = useMemo(() => {
    const raw = locationSearch.startsWith('?')
      ? locationSearch.slice(1)
      : locationSearch;
    return new URLSearchParams(raw);
  }, [locationSearch]);
  const compareModeActive =
    canCompare && isReportCompareView(searchParams.get(REPORT_VIEW_PARAM));

  // مقایسه خاموش: حتی با تایپ URL هم به لیست همان گزارش برگرد (قبل از paint).
  useLayoutEffect(() => {
    if (REPORT_COMPARE_ENABLED) return;
    if (typeof window === 'undefined') return;
    if (window.location.pathname !== pathname) return;
    const next = hrefWithoutDisabledReportCompare(
      pathname,
      window.location.search
    );
    if (next) replaceShallowHref(next);
  }, [locationSearch, pathname]);

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
  /** حالت انتخاب: با دکمهٔ «مقایسه» روشن می‌شود و چک‌باکس‌ها فقط در همین حالت دیده می‌شوند. */
  const [compareSelecting, setCompareSelecting] = useState(false);
  const [compareDraft, setCompareDraft] = useState<string[]>([]);
  const [compareQ, setCompareQ] = useState('');
  /** ردیف‌هایی که تا حالا دیده شده؛ انتخاب‌شده‌ها با عوض‌شدن فیلتر/صفحه از دست نروند. */
  const [compareRowsById, setCompareRowsById] = useState<
    Record<string, ReportRow>
  >({});
  useEffect(() => {
    if (!canCompare || rows.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCompareRowsById((prev) => {
      const next = { ...prev };
      for (const row of rows) next[row.id] = row;
      return next;
    });
  }, [canCompare, rows]);
  const compareCandidates = useMemo<ReportRow[]>(() => {
    const seen = new Set(rows.map((row) => row.id));
    const extra: ReportRow[] = [];
    for (const id of [...compareSelected, ...compareDraft]) {
      const row = compareRowsById[id];
      if (row && !seen.has(id)) {
        seen.add(id);
        extra.push(row);
      }
    }
    return [...rows, ...extra];
  }, [compareDraft, compareRowsById, compareSelected, rows]);

  /** ردیف انتخاب‌شده را از کش مقایسه یا صفحهٔ جاری پیدا کن. */
  const resolveCompareRow = useCallback(
    (id: string): ReportRow | undefined =>
      compareRowsById[id] ?? rows.find((row) => row.id === id),
    [compareRowsById, rows]
  );

  /** موارد مقایسه از روی ردیف‌های انتخاب‌شده؛ شاخص‌ها همان درصدهای ردیف‌اند. */
  const compareItems = useMemo<ReportCompareItem[]>(() => {
    const metricKeys = [
      'att',
      'attProf',
      'attMgr',
      'resp',
      'score',
      'days',
    ] as const;
    const infoColumns = columns.filter(
      (col) =>
        col.id !== 'name' &&
        col.sortKey &&
        (col.kind === 'text' || col.kind === 'phone' || col.kind === 'count')
    );
    const items: ReportCompareItem[] = [];
    for (const id of compareSelected) {
      const row = resolveCompareRow(id);
      if (!row) continue;
      const metrics: Record<string, number> = {};
      for (const key of metricKeys) {
        const value = row[key];
        if (typeof value === 'number' && Number.isFinite(value)) {
          metrics[key] = value;
        }
      }
      items.push({
        id: row.id,
        name: String(row.name ?? '').trim() || row.id,
        metrics,
        info: infoColumns.map((col) => {
          const value = row[col.sortKey as string];
          return {
            label: col.title,
            value:
              value === undefined || value === null || value === ''
                ? '—'
                : String(value),
          };
        }),
      });
    }
    return items;
  }, [columns, compareSelected, resolveCompareRow]);
  const lastSlugRef = useRef(slug);
  const compareHydratedRef = useRef(false);
  const skipDraftUrlSyncRef = useRef(false);

  // واکشی گزارش/فیلتر/دیالوگ — state محلی بعد از resolve سرویس؛ مشتق‌پذیر از props نیست.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setFilters((prev) => (Object.keys(prev).length === 0 ? prev : {}));
    setDraftFilters((prev) => (Object.keys(prev).length === 0 ? prev : {}));
    setQuery((q) => (q === '' ? q : ''));
    setSort((s) => {
      const next = defaultReportSort(slug);
      return s?.id === next?.id && s?.dir === next?.dir ? s : next;
    });
    setRows([]);
    setColumns(ReportsService.getColumnDefs(slug));
    setTotal(0);
    setIsLoading(true);
    setError(null);
    setCompareSelected([]);
    setCompareSelecting(false);
    setCompareDraft([]);
    setCompareRowsById({});
    setDialog(null);
    setAdvOpenState(false);
    setHasNextPage(false);
    setPageNo(1);
    setRoleHiddenKeys([]);
    setSemesterId('');
    compareHydratedRef.current = false;
    skipDraftUrlSyncRef.current = false;
    // روی mount اول، ?view=compare را برای دیپ‌لینک نگه دار؛ فقط با تعویض اسلاگ پاک کن.
    if (lastSlugRef.current === slug) {
      // mount: دیپ‌لینک ?view=compare&cmp=… حفظ می‌شود؛ ?cmp بدون view=compare باقی‌ماندهٔ قدیمی است.
      if (
        typeof window !== 'undefined' &&
        !isReportCompareView(
          new URLSearchParams(window.location.search).get(REPORT_VIEW_PARAM)
        )
      ) {
        setCompareIdsInUrl([]);
      }
    } else {
      lastSlugRef.current = slug;
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

  // لیست دوره‌ها از API فعلی پروژه؛ با تعویض نظام ترمی/پودمانی دوباره گرفته می‌شود.
  useEffect(() => {
    if (!isRealApi) return;
    let cancelled = false;
    const periodCacheKey = cacheUserId + '|' + periodMode;
    const cachedOptions = periodOptionsCache.get(periodCacheKey);
    if (cachedOptions) {
      setPeriodOptions(cachedOptions);
      return;
    }
    setPeriodOptions([]);
    void fetchReportPeriods(periodMode)
      .then((options) => {
        cacheSet(periodOptionsCache, periodCacheKey, options);
        if (!cancelled) setPeriodOptions(options);
      })
      .catch(() => {
        if (!cancelled) setPeriodOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [cacheUserId, isRealApi, periodMode]);

  /** نظام (ترمی/پودمانی) آخرین واکشی جدول؛ برای تشخیص تعویض تب. */
  const lastFetchModeRef = useRef(period.mode);

  useEffect(() => {
    let cancelled = false;
    const modeChanged = lastFetchModeRef.current !== period.mode;
    lastFetchModeRef.current = period.mode;
    const cached = reportPageCache.get(reportCacheKey);
    if (cached && Date.now() - cached.at < REPORT_CACHE_TTL_MS) {
      // همین ترکیب قبلاً گرفته شده (مثلاً برگشت از تب پودمانی به ترمی) → بدون درخواست.
      setRows(cached.rows);
      setColumns(cached.columns);
      setTotal(cached.total);
      setHasNextPage(cached.hasNextPage);
      setPageNo(cached.pageNo);
      setError(null);
      setIsLoading(false);
      return;
    }
    if (modeChanged) {
      // تعویض تب ترمی/پودمانی: ردیف‌های نظام قبلی نباید تا رسیدن پاسخ تب جدید دیده شوند.
      setRows([]);
      setTotal(0);
      setHasNextPage(false);
      setPageNo(1);
    }
    setIsLoading(true);
    setError(null);
    void (async () => {
      try {
        let pending = reportPageInflight.get(reportCacheKey);
        if (!pending) {
          pending = (async () => {
            const result = await ReportsService.queryReport({
              slug,
              filters,
              query: debouncedQuery,
              period,
              sort,
              page: 1,
              pageSize: REPORT_LIST_LIMIT,
            });
            const entry: CachedReportPage = {
              at: Date.now(),
              rows: result.rows,
              columns: result.columns,
              total: result.total,
              hasNextPage: result.hasNextPage ?? false,
              pageNo: 1,
            };
            // حتی اگر کاربر تب را عوض کرده، نتیجه برای همان ترکیب معتبر است.
            cacheSet(reportPageCache, reportCacheKey, entry);
            return entry;
          })().finally(() => {
            reportPageInflight.delete(reportCacheKey);
          });
          reportPageInflight.set(reportCacheKey, pending);
        }
        const entry = await pending;
        if (cancelled) return;
        setRows(entry.rows);
        setColumns(entry.columns);
        setTotal(entry.total);
        setHasNextPage(entry.hasNextPage);
        setPageNo(entry.pageNo);
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
  }, [slug, filters, debouncedQuery, period, sort, reportCacheKey]);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await ReportsService.queryReport({
        slug,
        filters,
        query: debouncedQuery,
        period,
        sort,
        page: 1,
        pageSize: REPORT_LIST_LIMIT,
      });
      // «بارگذاری دوباره» عمداً کش را دور می‌زند و آن را تازه می‌کند.
      cacheSet(reportPageCache, reportCacheKey, {
        at: Date.now(),
        rows: result.rows,
        columns: result.columns,
        total: result.total,
        hasNextPage: result.hasNextPage ?? false,
        pageNo: 1,
      });
      setRows(result.rows);
      setColumns(result.columns);
      setTotal(result.total);
      setHasNextPage(result.hasNextPage ?? false);
      setPageNo(1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'بارگذاری گزارش ناموفق بود.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [slug, filters, debouncedQuery, period, sort, reportCacheKey]);

  /**
   * کلیدهای قابل‌درخواست (بدون در نظر گرفتن «غایب در پاسخ»). effect باکس‌ها فقط به این
   * وابسته است؛ مخفی‌شدن باکس بعد از پاسخ نباید یک دور درخواست اضافه بزند.
   */
  const candidateKeys = useMemo(
    () => advKeysOf(slug, hiddenFilterKeys, extraFilterKeys),
    [slug, hiddenFilterKeys, extraFilterKeys]
  );
  // امضای رشته‌ای: اگر والد آرایهٔ تازه با همان محتوا بدهد، دوباره درخواست نزند.
  const candidateKeysSig = candidateKeys.join('|');
  const advKeys = useMemo(
    () => candidateKeys.filter((key) => !roleHiddenKeys.includes(key)),
    [candidateKeys, roleHiddenKeys]
  );

  const filtersRef = useRef(draftFilters);
  const advOpenRef = useRef(advOpen);
  const periodRef = useRef(period);
  useEffect(() => {
    filtersRef.current = draftFilters;
    periodRef.current = period;
    advOpenRef.current = advOpen;
  }, [advOpen, draftFilters, period]);

  /**
   * سرچ داخل یک باکس (مثلاً «تهران» در باکس استان):
   * `GET filters/:slug?field=province&search=تهران` — فقط لیست همان باکس عوض می‌شود،
   * باکس‌های دیگر و جدول دست نمی‌خورند. متن خالی لیست کامل را برمی‌گرداند.
   */
  const searchFilterBox = useCallback(
    (key: ReportFilterKey, text: string) => {
      if (!isRealApi) return;
      const search = text.trim();
      // بدون سرچ قبلی، «خالی» یعنی لیست همین الان کامل است.
      if (!search && !boxSearchActiveRef.current[key]) return;
      clearTimeout(boxSearchTimerRef.current[key]);
      const run = async () => {
        const seq = (boxSearchSeqRef.current[key] ?? 0) + 1;
        boxSearchSeqRef.current[key] = seq;
        boxSearchActiveRef.current[key] = Boolean(search);
        setFilterBoxLoading((prev) => ({ ...prev, [key]: true }));
        try {
          const box = await ReportsService.getReportFilterBox(
            slug,
            key,
            filtersRef.current,
            periodRef.current,
            search || undefined
          );
          // جواب قدیمی (سرچ تازه‌تر یا عوض‌شدن فیلترها) نادیده گرفته شود.
          if (boxSearchSeqRef.current[key] !== seq) return;
          if (box.status === 'ok') {
            setFilterOptions((prev) => ({ ...prev, [key]: box.options }));
          }
        } catch {
          // خطای شبکه: لیست قبلی بماند.
        } finally {
          if (boxSearchSeqRef.current[key] === seq) {
            setFilterBoxLoading((prev) => ({ ...prev, [key]: false }));
          }
        }
      };
      if (!search) {
        void run();
        return;
      }
      boxSearchTimerRef.current[key] = setTimeout(() => void run(), 300);
    },
    [isRealApi, slug]
  );

  useEffect(() => {
    let cancelled = false;
    if (isRealApi) {
      // فیلتر/والد عوض شده: لیست‌ها از نو گرفته می‌شود؛ سرچ‌های در راه باطل شوند.
      for (const timer of Object.values(boxSearchTimerRef.current)) {
        clearTimeout(timer);
      }
      boxSearchSeqRef.current = {};
      boxSearchActiveRef.current = {};
      setFilterBoxLoading({});
      const requestKeys: ReportFilterKey[] = candidateKeysSig
        ? (candidateKeysSig.split('|') as ReportFilterKey[])
        : [];
      let boxesFailed = false;
      const boxesCacheKey = JSON.stringify([
        cacheUserId,
        slug,
        period.mode,
        period.semesterId ?? '',
        draftFilters,
        candidateKeysSig,
      ]);
      const fetchBoxes = async (): Promise<
        (readonly [ReportFilterKey, LearnersFilterBox])[]
      > => {
        // حضور و غیاب: یک درخواست بدون field برای همهٔ باکس‌های مجاز نقش.
        try {
          const batch = await ReportsService.getReportFilterBoxes(
            slug,
            draftFilters,
            period
          );
          if (batch) {
            return requestKeys.map(
              (key) =>
                [key, batch[key] ?? { status: 'absent' as const }] as const
            );
          }
        } catch {
          boxesFailed = true;
          return requestKeys.map(
            (key) =>
              [key, { status: 'ok' as const, options: [] as ReportOption[] }] as const
          );
        }
        return Promise.all(
          requestKeys.map(async (key) => {
            try {
              const box = await ReportsService.getReportFilterBox(
                slug,
                key,
                draftFilters,
                period
              );
              return [key, box] as const;
            } catch {
              // خطای شبکه/سرور: باکس بماند ولی بدون گزینه.
              boxesFailed = true;
              return [
                key,
                { status: 'ok' as const, options: [] as ReportOption[] },
              ] as const;
            }
          })
        );
      };
      const loadBoxes = async (): Promise<
        (readonly [ReportFilterKey, LearnersFilterBox])[]
      > => {
        const hit = filterBoxesCache.get(boxesCacheKey);
        if (hit && Date.now() - hit.at < REPORT_CACHE_TTL_MS) return hit.entries;
        const inflight = filterBoxesInflight.get(boxesCacheKey);
        if (inflight) return inflight;
        boxesFailed = false;
        const pending = (async () => {
          const entries = await fetchBoxes();
          // پاسخ خطادار (باکس‌های خالیِ جایگزین) کش نشود.
          if (!boxesFailed) {
            cacheSet(filterBoxesCache, boxesCacheKey, {
              at: Date.now(),
              entries,
            });
          }
          return entries;
        })().finally(() => {
          filterBoxesInflight.delete(boxesCacheKey);
        });
        filterBoxesInflight.set(boxesCacheKey, pending);
        return pending;
      };
      void loadBoxes().then((entries) => {
        if (cancelled) return;
        const next: Partial<Record<ReportFilterKey, ReportOption[]>> = {};
        const absent: ReportFilterKey[] = [];
        const stale: ReportFilterKey[] = [];
        for (const [key, box] of entries) {
          if (box.status === 'absent') {
            absent.push(key);
          } else if (box.status === 'conflict') {
            // ۴۰۰: انتخاب با والد جدید نمی‌خواند؛ باکس را خالی کن تا دوباره گرفته شود.
            next[key] = [];
            if (draftFilters[key]) stale.push(key);
          } else {
            next[key] = box.options;
          }
        }
        setFilterOptions(next);
        if (absent.length > 0) {
          setRoleHiddenKeys((prev) => [
            ...prev,
            ...absent.filter((key) => !prev.includes(key)),
          ]);
        }
        if (stale.length > 0) {
          const clean = (prev: ReportFilters): ReportFilters => {
            const cleaned = { ...prev };
            for (const key of stale) delete cleaned[key];
            return cleaned;
          };
          setDraftFilters(clean);
          // کشو باز است → فقط پیش‌نویس؛ فیلتر اعمال‌شدهٔ جدول بدون تأیید کاربر دست نخورد.
          if (!advOpenRef.current) setFilters(clean);
        }
      });
      return () => {
        cancelled = true;
      };
    }
    return () => {
      cancelled = true;
    };
  }, [cacheUserId, slug, draftFilters, candidateKeysSig, isRealApi, period]);

  useEffect(() => {
    if (!dialog) {
      setCourseDetail(null);
      setScoreDetail(null);
      return;
    }
    // لیست/نمرات فراگیران: درس‌ها از ردیف؛ بقیهٔ عناوین از جزئیات نمرات.
    if ((realLearners || slug === 'scores') && dialog.type === 'courses') {
      const row = rows.find((r) => r.id === dialog.learnerId);
      setCourseDetail(
        row
          ? {
              learnerId: row.id,
              learnerName: row.name ?? '',
              periodLabel: '',
              courses: (row.courses ?? []).map((title, index) => ({
                id: String(index),
                name: title,
                code: '',
              })),
            }
          : null
      );
      const extra =
        row && typeof row.courseExtraCount === 'number' ? row.courseExtraCount : 0;
      if (!row || extra <= 0) {
        setDialogLoading(false);
        return;
      }
      // لیست فراگیران فقط عنوان اولین درس + شمارنده می‌دهد؛ بقیهٔ درس‌ها از جزئیات نمرات می‌آید.
      let stop = false;
      setDialogLoading(true);
      void ReportsService.getLearnerScoreDetails(row.id, period, row.name ?? '')
        .then((detail) => {
          if (stop) return;
          const seen = new Set<string>();
          const names: string[] = [];
          for (const name of [...(row.courses ?? []), ...detail.courses.map((c) => c.name)]) {
            if (name && !seen.has(name)) {
              seen.add(name);
              names.push(name);
            }
          }
          setCourseDetail({
            learnerId: row.id,
            learnerName: row.name ?? '',
            periodLabel: '',
            courses: names.map((name, index) => ({ id: String(index), name, code: '' })),
          });
        })
        .catch((err: unknown) => {
          if (stop) return;
          toast.error(
            err instanceof Error ? err.message : 'دریافت همهٔ درس‌ها ناموفق بود.'
          );
        })
        .finally(() => {
          if (!stop) setDialogLoading(false);
        });
      return () => {
        stop = true;
      };
    }
    let cancelled = false;
    setDialogLoading(true);
    const run = async () => {
      try {
        if (dialog.type === 'courses') {
          // درس‌ها از خود ردیف می‌آیند (بالا)؛ API جدا نداریم.
          if (!cancelled) setCourseDetail(null);
        } else {
          const detail = await ReportsService.getLearnerScoreDetails(
            dialog.learnerId,
            period,
            rowsRef.current.find((r) => r.id === dialog.learnerId)?.name ?? ''
          );
          if (!cancelled) {
            const row = rowsRef.current.find((r) => r.id === dialog.learnerId);
            setScoreDetail(withRowStatusFallback(detail, row?.status));
          }
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : 'دریافت اطلاعات ناموفق بود.'
          );
          setDialog(null);
        }
      } finally {
        if (!cancelled) setDialogLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [dialog, period, realLearners, rows, slug]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const activeAdvCount = useMemo(
    () => advKeys.filter((k) => Boolean(filters[k])).length,
    [advKeys, filters]
  );

  const anyFilterActive = Boolean(query) || activeAdvCount > 0;

  const setFilter = useCallback(
    (key: ReportFilterKey, value: string) => {
      // کنترل «زنده» نوار ابزار: هم جدول هم پیش‌نویس.
      const dependents = isRealApi ? descendantKeysFor(slug, key) : [];
      setFilters((prev) => nextFilters(prev, key, value, dependents));
      setDraftFilters((prev) => nextFilters(prev, key, value, dependents));
    },
    [isRealApi, slug]
  );

  /** تغییر در کشوی پیشرفته: فقط پیش‌نویس؛ جدول تا «تأیید و اعمال» عوض نمی‌شود. */
  const setDraftFilter = useCallback(
    (key: ReportFilterKey, value: string) => {
      const dependents = isRealApi ? descendantKeysFor(slug, key) : [];
      setDraftFilters((prev) => nextFilters(prev, key, value, dependents));
    },
    [isRealApi, slug]
  );

  /** «تأیید و اعمال فیلترها»: پیش‌نویس روی جدول اعمال و کشو بسته می‌شود. */
  const applyDraftFilters = useCallback(() => {
    setFilters((prev) =>
      JSON.stringify(prev) === JSON.stringify(draftFilters) ? prev : draftFilters
    );
    setAdvOpenState(false);
  }, [draftFilters]);

  /** «پاک کردن» داخل کشو: فقط پیش‌نویس خالی می‌شود؛ با «تأیید و اعمال» روی جدول می‌نشیند. */
  const clearDraftFilters = useCallback(() => {
    setDraftFilters((prev) => (Object.keys(prev).length === 0 ? prev : {}));
  }, []);

  /** باز/بسته‌شدن کشو؛ پیش‌نویس همیشه از فیلترهای اعمال‌شده شروع می‌شود (تغییر تأییدنشده دور ریخته می‌شود). */
  const setAdvOpen = useCallback(
    (open: boolean) => {
      setDraftFilters(filters);
      setAdvOpenState(open);
    },
    [filters]
  );

  const clearFilters = useCallback(() => {
    setFilters((prev) => (Object.keys(prev).length === 0 ? prev : {}));
    setDraftFilters((prev) => (Object.keys(prev).length === 0 ? prev : {}));
    setQuery((q) => (q === '' ? q : ''));
  }, []);

  /** عملکرد Nest: اولین کلیک desc (زیاد→کم)، بعد asc، بعد لغو. */
  const toggleSort = useCallback((colId: string) => {
    setSort((prev) => {
      // ستون تازه: بیشترین → کمترین؛ کلیک دوباره فقط جهت را برعکس می‌کند (بدون حالت «بی‌ترتیب»).
      if (!prev || prev.id !== colId) return { id: colId, dir: 'desc' };
      return { id: colId, dir: prev.dir === 'desc' ? 'asc' : 'desc' };
    });
  }, []);

  const setMode = useCallback(
    (mode: ReportPeriodMode) => {
      // semesterId با structure جدید نمی‌خواند (400)؛ انتخاب قبلی پاک شود.
      setSemesterId('');
      setPeriodMode(mode);
    },
    [setPeriodMode]
  );

  const setPeriodId = useCallback(
    (id: string) => {
      setSemesterId(id);
    },
    []
  );

  const exportStub = useCallback(
    (format: 'PDF' | 'اکسل') => {
      if (!isRealApi) {
        toast.message(`فایل ${format} آماده شد`);
        return;
      }
      // همهٔ صفحه‌ها با همان فیلترهای جدول (نه فقط صفحهٔ جاری).
      toast.promise(
        ReportsService.exportReport(slug, {
          format: format === 'PDF' ? 'pdf' : 'excel',
          filters,
          query,
          period,
          sort,
        }),
        {
          loading: `در حال آماده‌سازی فایل ${format}…`,
          success: `فایل ${format} دانلود شد`,
          error: (err: unknown) =>
            err instanceof Error ? err.message : 'دریافت فایل ناموفق بود.',
        }
      );
    },
    [filters, isRealApi, period, query, slug, sort]
  );

  const loadMore = useCallback(async () => {
    if (!isRealApi || !hasNextPage || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const next = await ReportsService.queryReport({
        slug,
        filters,
        query: debouncedQuery,
        period,
        sort,
        page: pageNo + 1,
        pageSize: REPORT_LIST_LIMIT,
      });
      cacheSet(reportPageCache, reportCacheKey, {
        at: reportPageCache.get(reportCacheKey)?.at ?? Date.now(),
        rows: [...rows, ...next.rows],
        columns,
        total: total + next.rows.length,
        hasNextPage: next.hasNextPage ?? false,
        pageNo: next.page,
      });
      setRows((prev) => [...prev, ...next.rows]);
      setTotal((prev) => prev + next.rows.length);
      setHasNextPage(next.hasNextPage ?? false);
      setPageNo(next.page);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'بارگذاری ردیف‌های بیشتر ناموفق بود.'
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    columns,
    filters,
    hasNextPage,
    isLoadingMore,
    isRealApi,
    pageNo,
    period,
    debouncedQuery,
    reportCacheKey,
    rows,
    slug,
    sort,
    total,
  ]);

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
    setCompareSelecting(false);
    setCompareModeInUrl(true);
    setCompareIdsInUrl(ids);
  }, [canCompare, compareSelected, setCompareIdsInUrl, setCompareModeInUrl]);

  /** دکمهٔ «مقایسه»: چک‌باکس‌ها ظاهر می‌شوند (هنوز وارد صفحهٔ مقایسه نمی‌شود). */
  const startCompareSelection = useCallback(() => {
    if (!canCompare) return;
    setCompareSelecting(true);
  }, [canCompare]);

  /** «انصراف»: چک‌باکس‌ها مخفی و انتخاب پاک می‌شود. */
  const cancelCompareSelection = useCallback(() => {
    setCompareSelecting(false);
    setCompareSelected([]);
    setCompareIdsInUrl([]);
  }, [setCompareIdsInUrl]);

  const exitCompare = useCallback(() => {
    setCompareModeInUrl(false);
    // اگر انتخابی مانده، در لیست هم چک‌باکس‌ها و نوار تأیید دیده شوند.
    setCompareSelecting(compareSelected.length > 0);
    setCompareDraft([]);
    setCompareQ('');
    compareHydratedRef.current = false;
    // cmp را نگه می‌داریم تا انتخاب لیست بعد از خروج از مقایسه زنده بماند.
  }, [compareSelected.length, setCompareModeInUrl]);

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

  const confirmCompare = useCallback(() => {
    if (compareDraft.length < COMPARE_MIN) return;
    const ids = compareDraft.slice();
    // ردیف‌های انتخاب‌شده را قفل کن تا با رفرش/سورت صفحه از دست نروند.
    setCompareRowsById((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        if (next[id]) continue;
        const row = rows.find((item) => item.id === id);
        if (row) next[id] = row;
      }
      return next;
    });
    setCompareSelected(ids);
    setCompareIdsInUrl(ids);
  }, [compareDraft, rows, setCompareIdsInUrl]);

  /**
   * گزارش‌های عملکرد را API مرتب می‌کند. بقیه سمت کلاینت و روی «همهٔ ردیف‌های بارگذاری‌شده»
   * مرتب می‌شوند تا بعد از «بارگذاری بیشتر» ترتیب صفحه‌های بعدی با قبلی قاطی نشود.
   */
  const sortedRows = useMemo(
    () =>
      isPerformanceReportSlug(slug) ? rows : sortLoadedRows(rows, columns, sort),
    [columns, rows, slug, sort]
  );

  return {
    slug,
    def,
    showPeriod: hasPeriod(def),
    period,
    setMode,
    setPeriodId,
    /** گزینه‌های دورهٔ واقعی (فقط گزارش‌های real). */
    periodOptions,
    filters,
    setFilter,
    draftFilters,
    setDraftFilter,
    applyDraftFilters,
    clearDraftFilters,
    query,
    setQuery,
    sort,
    toggleSort,
    rows: sortedRows,
    columns,
    total,
    isLoading,
    error,
    reload,
    hasNextPage,
    isLoadingMore,
    loadMore,
    filterOptions,
    filterBoxLoading,
    searchFilterBox,
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
    compareSelecting,
    startCompareSelection,
    cancelCompareSelection,
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

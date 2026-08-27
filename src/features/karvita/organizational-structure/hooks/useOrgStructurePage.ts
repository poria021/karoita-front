'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useOffsetLimitInfiniteList } from '@/hooks/useOffsetLimitInfiniteList';
import { useSyncedUrlParam } from '@/hooks/useSyncedUrlParam';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import {
  resolveListSearchQuery,
  SEARCH_DEBOUNCE_MS,
} from '@/lib/search-debounce';
import { scheduleOptimisticMutation, scheduleUndoableMutation } from '@/lib/undoable-mutation';
import { IS_MOCK_MODE } from '@/lib/api-mode';
import {
  ORG_STRUCTURE_PAGE_SIZE,
  OrgStructureService,
  type OrgStructureListItem,
} from '@/services/org-structure.service';
import { flushBareListCache } from '@/services/org-structure/real/real-org-reads';
import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import {
  orgEntityKindFromTab,
  type OrgStructureSubTab,
} from '@/types/org-structure';

import { getOrgTabConfig, ORG_STRUCTURE_TABS } from '../constants';
import { submitOrgEntity } from '../lib/orgEntitySubmitHandlers';
import {
  ORG_STRUCTURE_CACHE_NAMESPACE,
  ORG_STRUCTURE_CHROME_ID,
  orgStructureListResetKey,
} from '../lib/orgStructureListKeys';
import type { OrgEntityFormValues } from '../schemas/org-structure.schema';

const ORG_STRUCTURE_TAB_KEYS = ORG_STRUCTURE_TABS.map(
  (item) => item.key
) as OrgStructureSubTab[];

type OrgChrome = {
  tab: OrgStructureSubTab;
  query: string;
};

export const entityKindFromTab = orgEntityKindFromTab;

/**
 * نام‌های نمایشی (نه id) والد/نقش مرتبط با رکورد در حال ساخت — OrgStructureEntityModal
 * این را از روی lists همون مدالی که برای selectها دارد resolve می‌کنه و به scheduleCreate
 * پاس می‌دهد تا ستون‌های استان/شهر/منطقه در ردیف optimistic هم از همان لحظه‌ی اول
 * پر باشند تا invalidateAndReload تمام شود.
 */
export type OrgEntityOptimisticLabels = {
  provinceName?: string;
  cityName?: string;
  districtName?: string;
  roleName?: string;
};

function buildOptimisticRow(
  tab: OrgStructureSubTab,
  values: OrgEntityFormValues,
  tempId: string,
  labels: OrgEntityOptimisticLabels = {}
): OrgStructureListItem {
  return {
    id: tempId,
    name: values.name.trim(),
    kind: orgEntityKindFromTab(tab),
    deleteBlocked: false,
    audience: values.audience,
    gender: values.gender,
    provinceName: labels.provinceName,
    cityName: labels.cityName,
    districtName: labels.districtName,
    roleName: labels.roleName,
    campusesCount: 0,
    districtsCount: 0,
    schoolsCount: 0,
    usersCount: 0,
  };
}

export function useOrgStructurePage() {
  const queryClient = useQueryClient();

  const getChrome = useDashboardModuleCache((s) => s.getChrome);
  const setChrome = useDashboardModuleCache((s) => s.setChrome);
  const cachedChrome = getChrome<OrgChrome>(ORG_STRUCTURE_CHROME_ID);

  const [tab, setTab] = useSyncedUrlParam<OrgStructureSubTab>({
    name: 'tab',
    allowed: ORG_STRUCTURE_TAB_KEYS,
    defaultValue: 'provinces',
    preferWhenMissing: cachedChrome?.tab,
  });
  const [query, setQuery] = useState(() => cachedChrome?.query ?? '');
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<OrgStructureListItem | null>(null);

  const tabConfig = useMemo(() => getOrgTabConfig(tab), [tab]);
  const listQuery = resolveListSearchQuery(query, debouncedQuery);
  const resetKey = orgStructureListResetKey(tab, listQuery);

  useEffect(() => {
    setChrome<OrgChrome>(ORG_STRUCTURE_CHROME_ID, { tab, query });
  }, [tab, query, setChrome]);

  const fetchPage = useCallback(
    async ({ offset, limit }: { offset: number; limit: number }) =>
      OrgStructureService.listPage({
        tab,
        query: listQuery,
        offset,
        limit,
      }),
    [tab, listQuery]
  );

  const list = useOffsetLimitInfiniteList<OrgStructureListItem>({
    resetKey,
    fetchPage,
    pageSize: ORG_STRUCTURE_PAGE_SIZE,
    cacheNamespace: ORG_STRUCTURE_CACHE_NAMESPACE,
  });

  // Warm the entity-modal's province select cache as soon as the org
  // structure page mounts — shares the query key with useOrgEntityForm's
  // provincesQuery, so react-query dedupes/caches across both.
  useQuery({
    queryKey: [ORG_STRUCTURE_CACHE_NAMESPACE, 'provinces'],
    queryFn: () => OrgStructureService.listProvinces(),
    staleTime: QUERY_STALE_MS.list,
  });

  const changeTab = useCallback(
    (next: OrgStructureSubTab) => {
      setTab(next);
      setQuery('');
    },
    [setTab]
  );

  const openCreate = useCallback(() => {
    setEditId(null);
    setEditorOpen(true);
  }, []);

  const openEdit = useCallback((row: OrgStructureListItem) => {
    setEditId(row.id);
    setEditRow(row);
    setEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
    setEditId(null);
    setEditRow(null);
  }, []);

  /**
   * پس از ذخیره موفق (create یا edit)، کش را به‌طور کامل باطل می‌کنیم
   * تا `reload()` حتماً داده‌ی تازه از سرور بگیرد — حتی اگر staleTime
   * هنوز نگذشته باشد.
   *
   * ترتیب اجرا اهمیت دارد:
   * 1. flushBareListCache: حذف فیزیکی تمام ورودی‌های in-memory bareListCache
   *    (districts/schools/majors/faculties) — باید قبل از reload باشه تا
   *    getBareListItems در listRealPage هیچ entry قدیمی‌ای پیدا نکنه.
   * 2. invalidateQueries: باطل‌سازی react-query cache برای provinces/cities
   *    (paginated) و dropdown‌های province/city/district داخل فرم.
   * 3. list.reload(): refetch صفحه اول از Nest — در این مرحله هر دو cache
   *    پاک شده‌اند و داده تازه گرفته می‌شه.
   */
  const invalidateAndReload = useCallback(async () => {
    // ۱. hard-flush bareListCache (in-memory, خارج از react-query)
    if (!IS_MOCK_MODE) {
      flushBareListCache();
    }
    // ۲. باطل‌سازی react-query cache برای تمام کلیدهای org-structure
    await queryClient.invalidateQueries({
      queryKey: [ORG_STRUCTURE_CACHE_NAMESPACE],
    });
    // ۳. refetch — هر دو cache پاک شده‌اند، Nest داده تازه برمی‌گردونه
    await list.reload();
  }, [queryClient, list]);

  const reload = list.reload;
  const patchItems = list.patchItems;

  const scheduleCreate = useCallback(
    (values: OrgEntityFormValues, labels?: OrgEntityOptimisticLabels) => {
      const label = values.name.trim();
      const tempId = `temp-org-${Date.now()}`;
      const optimistic = buildOptimisticRow(tab, values, tempId, labels);
      let snapshot: OrgStructureListItem[] = [];
      let snapshotTotal = 0;

      scheduleOptimisticMutation({
        message: `${tabConfig.addLabel} «${label}» افزوده شد.`,
        apply: () => {
          patchItems(
            (prev) => {
              snapshot = prev;
              return [optimistic, ...prev];
            },
            (prevTotal) => {
              snapshotTotal = prevTotal;
              return prevTotal + 1;
            }
          );
        },
        revert: () => {
          patchItems(() => snapshot, () => snapshotTotal);
        },
        commit: () => submitOrgEntity(tab, values, null),
        onCommitted: async () => {
          await invalidateAndReload();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : 'افزودن ساختار ناموفق بود.'
          );
        },
      });
    },
    [patchItems, invalidateAndReload, tab, tabConfig.addLabel]
  );

  const requestDelete = useCallback(
    (row: OrgStructureListItem) => {
      if (row.deleteBlocked) return;

      let snapshot: OrgStructureListItem[] = [];
      let snapshotTotal = 0;

      scheduleUndoableMutation({
        tone: 'error',
        message: `«${row.name}» از ساختار سازمانی حذف شد.`,
        undoLabel: 'لغو',
        // real mode: commit تا بسته‌شدن toast به تأخیر می‌افتد تا «لغو» واقعی باشد.
        // mock mode: commit فوری لازم است تا داده در localStorage قبل از reload ذخیره شود.
        deferCommit: !IS_MOCK_MODE,
        apply: () => {
          patchItems(
            (prev) => {
              snapshot = prev;
              return prev.filter((item) => item.id !== row.id);
            },
            (prevTotal) => {
              snapshotTotal = prevTotal;
              return Math.max(0, prevTotal - 1);
            }
          );
        },
        revert: () => {
          patchItems(() => snapshot, () => snapshotTotal);
        },
        commit: () => OrgStructureService.deleteEntity(row.kind, row.id),
        onCommitted: async () => {
          await invalidateAndReload();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'حذف از ساختار سازمانی ناموفق بود.'
          );
        },
      });
    },
    [patchItems, invalidateAndReload]
  );

  const handleLoadMore = useCallback(() => {
    void list.loadMore();
  }, [list]);

  const handleRetryLoadMore = useCallback(() => {
    list.clearLoadMoreError();
    void list.loadMore();
  }, [list]);

  const handleReload = useCallback(() => {
    void list.reload();
  }, [list]);

  return {
    tab,
    changeTab,
    tabConfig,
    query,
    setQuery,
    items: list.items,
    total: list.total,
    hasMore: list.hasMore,
    isLoading: list.isLoading,
    isLoadingMore: list.isLoadingMore,
    error: list.error,
    loadMoreError: list.loadMoreError,
    loadMore: handleLoadMore,
    reload: handleReload,
    retryLoadMore: handleRetryLoadMore,
    clearLoadMoreError: list.clearLoadMoreError,
    editorOpen,
    editId,
    editRow,
    openCreate,
    openEdit,
    closeEditor,
    scheduleCreate,
    requestDelete,
    entityKind: entityKindFromTab(tab),
    /** برای استفاده در OrgStructureEntityModal — باطل‌سازی کش + reload */
    invalidateAndReload,
  };
}

export type UseOrgStructurePageReturn = ReturnType<typeof useOrgStructurePage>;

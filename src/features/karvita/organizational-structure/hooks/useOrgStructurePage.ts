'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useOffsetLimitInfiniteList } from '@/hooks/useOffsetLimitInfiniteList';
import {
  ORG_STRUCTURE_PAGE_SIZE,
  OrgStructureService,
  type OrgStructureListItem,
} from '@/services/org-structure.service';
import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import {
  orgEntityKindFromTab,
  type OrgStructureSubTab,
} from '@/types/org-structure';

import { getOrgTabConfig } from '../constants';
import {
  ORG_STRUCTURE_CACHE_NAMESPACE,
  ORG_STRUCTURE_CHROME_ID,
  orgStructureListResetKey,
} from './orgStructureListKeys';

const SEARCH_DEBOUNCE_MS = 300;

type OrgChrome = {
  tab: OrgStructureSubTab;
  query: string;
};

export const entityKindFromTab = orgEntityKindFromTab;

export function useOrgStructurePage() {
  const getChrome = useDashboardModuleCache((s) => s.getChrome);
  const setChrome = useDashboardModuleCache((s) => s.setChrome);
  const cachedChrome = getChrome<OrgChrome>(ORG_STRUCTURE_CHROME_ID);

  const [tab, setTab] = useState<OrgStructureSubTab>(
    () => cachedChrome?.tab ?? 'provinces'
  );
  const [query, setQuery] = useState(() => cachedChrome?.query ?? '');
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<OrgStructureListItem | null>(
    null
  );

  const tabConfig = useMemo(() => getOrgTabConfig(tab), [tab]);
  const listQuery = query.trim() === '' ? '' : debouncedQuery;
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

  const changeTab = useCallback((next: OrgStructureSubTab) => {
    setTab(next);
    setQuery('');
  }, []);

  const openCreate = useCallback(() => {
    setEditId(null);
    setEditorOpen(true);
  }, []);

  const openEdit = useCallback((row: OrgStructureListItem) => {
    setEditId(row.id);
    setEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
    setEditId(null);
  }, []);

  const requestDelete = useCallback((row: OrgStructureListItem) => {
    if (row.deleteBlocked) return;
    setDeleteTarget(row);
  }, []);

  const reload = list.reload;

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await OrgStructureService.deleteEntity(deleteTarget.kind, deleteTarget.id);
    setDeleteTarget(null);
    await reload();
  }, [deleteTarget, reload]);

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
    isCold: list.isCold,
    error: list.error,
    loadMoreError: list.loadMoreError,
    loadMore: list.loadMore,
    reload: list.reload,
    clearLoadMoreError: list.clearLoadMoreError,
    editorOpen,
    editId,
    openCreate,
    openEdit,
    closeEditor,
    deleteTarget,
    requestDelete,
    clearDelete: () => setDeleteTarget(null),
    confirmDelete,
    entityKind: entityKindFromTab(tab),
  };
}

export type UseOrgStructurePageReturn = ReturnType<typeof useOrgStructurePage>;

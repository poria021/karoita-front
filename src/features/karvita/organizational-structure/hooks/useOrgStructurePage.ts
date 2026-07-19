'use client';

import { useCallback, useMemo, useState } from 'react';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useOffsetLimitInfiniteList } from '@/hooks/useOffsetLimitInfiniteList';
import {
  ORG_STRUCTURE_PAGE_SIZE,
  OrgStructureService,
  type OrgStructureListItem,
} from '@/services/org-structure.service';
import {
  orgEntityKindFromTab,
  type OrgStructureSubTab,
} from '@/types/org-structure';

import { getOrgTabConfig } from '../constants';

const SEARCH_DEBOUNCE_MS = 300;

/** @deprecated Prefer `orgEntityKindFromTab` from `@/types/org-structure`. */
export const entityKindFromTab = orgEntityKindFromTab;

/**
 * Page state for org structure — paged via Facade (limit=10), owns tab/search/modals.
 * Search input is immediate; Facade fetches use a debounced query.
 */
export function useOrgStructurePage() {
  const [tab, setTab] = useState<OrgStructureSubTab>('provinces');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<OrgStructureListItem | null>(
    null
  );

  const tabConfig = useMemo(() => getOrgTabConfig(tab), [tab]);
  const resetKey = `${tab}::${debouncedQuery}`;

  const fetchPage = useCallback(
    async ({ offset, limit }: { offset: number; limit: number }) =>
      OrgStructureService.listPage({
        tab,
        query: debouncedQuery,
        offset,
        limit,
      }),
    [tab, debouncedQuery]
  );

  const list = useOffsetLimitInfiniteList<OrgStructureListItem>({
    resetKey,
    fetchPage,
    pageSize: ORG_STRUCTURE_PAGE_SIZE,
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

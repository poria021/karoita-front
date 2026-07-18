'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useOffsetLimitInfiniteList } from '@/hooks/useOffsetLimitInfiniteList';
import {
  ORG_STRUCTURE_PAGE_SIZE,
  OrgStructureService,
  type OrgStructureListItem,
} from '@/services/org-structure.service';
import type {
  OrgStructureEntityKind,
  OrgStructureSubTab,
} from '@/types/org-structure';

import { getOrgTabConfig } from '../constants';

export function entityKindFromTab(tab: OrgStructureSubTab): OrgStructureEntityKind {
  const map: Record<OrgStructureSubTab, OrgStructureEntityKind> = {
    provinces: 'province',
    cities: 'city',
    districts: 'district',
    schools: 'school',
    majors: 'major',
    faculties: 'faculty',
  };
  return map[tab];
}

/**
 * Page state for org structure — paged via Facade (limit=10), owns tab/search/modals.
 */
export function useOrgStructurePage() {
  const [tab, setTab] = useState<OrgStructureSubTab>('provinces');
  const [query, setQuery] = useState('');

  const [editorOpen, setEditorOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<OrgStructureListItem | null>(
    null
  );

  const tabConfig = useMemo(() => getOrgTabConfig(tab), [tab]);
  const resetKey = `${tab}::${query}`;

  const fetchPage = useCallback(
    async ({ offset, limit }: { offset: number; limit: number }) =>
      OrgStructureService.listPage({ tab, query, offset, limit }),
    [tab, query]
  );

  const list = useOffsetLimitInfiniteList<OrgStructureListItem>({
    resetKey,
    fetchPage,
    pageSize: ORG_STRUCTURE_PAGE_SIZE,
  });

  useEffect(() => {
    setQuery('');
  }, [tab]);

  const changeTab = useCallback((next: OrgStructureSubTab) => {
    setTab(next);
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

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await OrgStructureService.deleteEntity(deleteTarget.kind, deleteTarget.id);
    setDeleteTarget(null);
    await list.reload();
  }, [deleteTarget, list.reload]);

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

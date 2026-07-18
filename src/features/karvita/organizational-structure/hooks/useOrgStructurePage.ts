'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
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
 * Page state for org structure — loads via Facade, owns tab/search/modals.
 */
export function useOrgStructurePage() {
  const [tab, setTab] = useState<OrgStructureSubTab>('provinces');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<OrgStructureListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<OrgStructureListItem | null>(
    null
  );

  const tabConfig = useMemo(() => getOrgTabConfig(tab), [tab]);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rows = await OrgStructureService.listByTab(tab, query);
      setItems(rows);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'بارگذاری ساختار سازمانی ناموفق بود.'
      );
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [tab, query]);

  useEffect(() => {
    void reload();
  }, [reload]);

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
    await reload();
  }, [deleteTarget, reload]);

  return {
    tab,
    changeTab,
    tabConfig,
    query,
    setQuery,
    items,
    isLoading,
    error,
    reload,
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

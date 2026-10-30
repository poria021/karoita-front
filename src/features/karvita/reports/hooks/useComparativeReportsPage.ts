'use client';

import { useEffect, useMemo, useState } from 'react';

import type { UserRole } from '@/types/auth';
import { useUserStore } from '@/store/useUserStore';

import {
  COMPARATIVE_MAX_ENTITIES,
  COMPARATIVE_MIN_ENTITIES,
  getReportCompareSpec,
} from '../catalog/compareSpecs';
import { REPORT_FILTER_DEFS } from '../catalog/filters';
import {
  buildEntitySeries,
  listEntityPool,
} from '../lib/compareMetrics';
import {
  comparableReportsForRole,
  getReportDefinition,
  resolveComparativeFilterKeys,
  resolveReportLabel,
} from '../lib/reportsAccess';

export function useComparativeReportsPage() {
  const role = useUserStore((s) => s.activeUser?.role) as UserRole | undefined;
  const views = useMemo(
    () => (role ? comparableReportsForRole(role) : []),
    [role]
  );

  const [reportId, setReportId] = useState('');
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState<Record<string, string>>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    /* همگام‌سازی گزارش پیش‌فرض با فهرست مجاز نقش */
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!views.length) {
      setReportId('');
      return;
    }
    if (!views.some((v) => v.id === reportId)) {
      setReportId(views[0]!.id);
      setApplied({});
      setDraft({});
      setSelectedIds([]);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [views, reportId]);

  const report = reportId ? getReportDefinition(reportId) : undefined;
  const compareSpec = reportId ? getReportCompareSpec(reportId) : undefined;
  const label = role && report ? resolveReportLabel(report, role) : '';
  const filterKeys =
    role && report ? resolveComparativeFilterKeys(report, role) : [];
  const filterDefs = filterKeys
    .map((k) => REPORT_FILTER_DEFS[k])
    .filter(Boolean);

  const scopedRows = useMemo(() => {
    if (!report) return [];
    let list = report.rows;
    for (const [, value] of Object.entries(applied)) {
      if (!value) continue;
      list = list.filter((row) =>
        Object.values(row).some((cell) => String(cell).includes(value))
      );
    }
    return list;
  }, [report, applied]);

  const entityPool = useMemo(() => {
    if (!compareSpec) return [];
    return listEntityPool(scopedRows, compareSpec.entityKey);
  }, [scopedRows, compareSpec]);

  // همگام‌سازی انتخاب با استخر موجودیت‌ها + پیش‌فرض ۲ تا ۴ تای اول
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!entityPool.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds((prev) => {
      const stillValid = prev.filter((id) => entityPool.includes(id));
      if (stillValid.length >= COMPARATIVE_MIN_ENTITIES) return stillValid;
      return entityPool.slice(
        0,
        Math.min(COMPARATIVE_MAX_ENTITIES, Math.max(COMPARATIVE_MIN_ENTITIES, entityPool.length))
      );
    });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [entityPool]);

  const series = useMemo(() => {
    if (!compareSpec) return [];
    return buildEntitySeries(
      scopedRows,
      compareSpec.entityKey,
      compareSpec.metrics,
      selectedIds
    );
  }, [scopedRows, compareSpec, selectedIds]);

  const activeFilterCount = Object.values(applied).filter(Boolean).length;

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  function selectReport(id: string) {
    setReportId(id);
    setApplied({});
    setDraft({});
    setSelectedIds([]);
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), 160);
  }

  function toggleEntity(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= COMPARATIVE_MIN_ENTITIES) {
          flash(`حداقل ${COMPARATIVE_MIN_ENTITIES} مورد برای مقایسه لازم است`);
          return prev;
        }
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= COMPARATIVE_MAX_ENTITIES) {
        flash(`حداکثر ${COMPARATIVE_MAX_ENTITIES} مورد قابل مقایسه است`);
        return prev;
      }
      return [...prev, id];
    });
  }

  function openFilters() {
    const next: Record<string, string> = {};
    filterKeys.forEach((k) => {
      next[k] = applied[k] ?? '';
    });
    setDraft(next);
    setFiltersOpen(true);
  }

  function applyFilters() {
    const next: Record<string, string> = {};
    filterKeys.forEach((k) => {
      next[k] = draft[k] ?? '';
    });
    setApplied(next);
    setFiltersOpen(false);
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), 160);
  }

  function clearFilters() {
    setApplied({});
    setDraft({});
  }

  function clearFilter(key: string) {
    setApplied((prev) => ({ ...prev, [key]: '' }));
    setDraft((prev) => ({ ...prev, [key]: '' }));
  }

  return {
    role,
    views,
    reportId,
    report,
    compareSpec,
    label,
    filterDefs,
    filterKeys,
    scopedRows,
    entityPool,
    selectedIds,
    series,
    draft,
    setDraft,
    applied,
    activeFilterCount,
    filtersOpen,
    setFiltersOpen,
    isLoading,
    toast,
    selectReport,
    toggleEntity,
    openFilters,
    applyFilters,
    clearFilters,
    clearFilter,
    maxEntities: COMPARATIVE_MAX_ENTITIES,
    minEntities: COMPARATIVE_MIN_ENTITIES,
  };
}

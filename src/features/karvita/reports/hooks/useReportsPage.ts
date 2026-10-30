'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import type { UserRole } from '@/types/auth';
import { useUserStore } from '@/store/useUserStore';

import { REPORT_FILTER_DEFS } from '../catalog/filters';
import {
  getReportDefinition,
  reportsForRole,
  resolveReportColumns,
  resolveReportFilterKeys,
  resolveReportLabel,
} from '../lib/reportsAccess';

export function useReportsPage() {
  const role = useUserStore((s) => s.activeUser?.role) as UserRole | undefined;
  const searchParams = useSearchParams();
  const queryReport = searchParams.get('report');
  const views = useMemo(() => (role ? reportsForRole(role) : []), [role]);
  const [reportId, setReportId] = useState('');
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState<Record<string, string>>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    /* همگام‌سازی report از URL / نقش */
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!views.length) {
      setReportId('');
      return;
    }
    if (queryReport && views.some((v) => v.id === queryReport)) {
      if (reportId !== queryReport) {
        setReportId(queryReport);
        setApplied({});
        setDraft({});
      }
      return;
    }
    if (!views.some((v) => v.id === reportId)) {
      setReportId(views[0]!.id);
      setApplied({});
      setDraft({});
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [views, reportId, queryReport]);

  const report = reportId ? getReportDefinition(reportId) : undefined;
  const label = role && report ? resolveReportLabel(report, role) : '';
  const columns = role && report ? resolveReportColumns(report, role) : [];
  const filterKeys =
    role && report ? resolveReportFilterKeys(report, role) : [];
  const filterDefs = filterKeys
    .map((k) => REPORT_FILTER_DEFS[k])
    .filter(Boolean);

  const rows = useMemo(() => {
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

  const activeFilterCount = Object.values(applied).filter(Boolean).length;

  function selectReport(id: string) {
    setReportId(id);
    setApplied({});
    setDraft({});
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), 160);
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
    label,
    columns,
    filterDefs,
    filterKeys,
    rows,
    draft,
    setDraft,
    applied,
    activeFilterCount,
    filtersOpen,
    setFiltersOpen,
    isLoading,
    selectReport,
    openFilters,
    applyFilters,
    clearFilters,
    clearFilter,
  };
}

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  cloneMatrix,
  diffMatrices,
  matricesEqual,
  setAccess,
  setCompare,
  viewAccess,
  viewCompare,
} from '@/features/karvita/report-access/lib/access-matrix';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { ReportAccessService } from '@/services/report-access.service';
import type {
  ReportAccessDiff,
  ReportAccessMatrix,
  ReportAccessRoleId,
  ReportSlug,
} from '@/types/report-access';
import { toPersianDigits } from '@/utils/persianDigits';

const DEFAULT_ROLE: ReportAccessRoleId = 'supervisor_professor';

export function useReportAccessPage() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState<ReportAccessMatrix | null>(null);
  const [draft, setDraft] = useState<ReportAccessMatrix | null>(null);
  const [approvedDoc, setApprovedDoc] = useState<ReportAccessMatrix | null>(
    null
  );
  const [provinceIds, setProvinceIds] = useState<string[]>([]);
  const [provinceNames, setProvinceNames] = useState<Record<string, string>>(
    {}
  );
  const [roleId, setRoleId] = useState<ReportAccessRoleId>(DEFAULT_ROLE);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [snapshot, approved] = await Promise.all([
        ReportAccessService.getSnapshot(),
        ReportAccessService.getApprovedDocument(),
      ]);
      setSaved(cloneMatrix(snapshot.matrix));
      setDraft(cloneMatrix(snapshot.matrix));
      setApprovedDoc(cloneMatrix(approved));
      setProvinceIds(snapshot.provinceIds);
      setProvinceNames(snapshot.provinceNames);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'بارگذاری ماتریس دسترسی ناموفق بود.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const diffs = useMemo(
    () => (saved && draft ? diffMatrices(saved, draft) : []),
    [saved, draft]
  );

  const dirtyRoleIds = useMemo(() => {
    const set = new Set<ReportAccessRoleId>();
    for (const d of diffs) set.add(d.roleId);
    return set;
  }, [diffs]);

  const matchesApproved = Boolean(
    draft && approvedDoc && matricesEqual(draft, approvedDoc)
  );

  useEffect(() => {
    if (!diffs.length) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [diffs.length]);

  const toggleReport = useCallback(
    (slug: ReportSlug) => {
      if (!provinceIds.length) return;
      setDraft((prev) => {
        if (!prev) return prev;
        const next = cloneMatrix(prev);
        const current = viewAccess(next, roleId, slug, provinceIds);
        setAccess(next, roleId, slug, provinceIds, current !== 'on');
        return next;
      });
    },
    [provinceIds, roleId]
  );

  const toggleCompare = useCallback(
    (slug: ReportSlug) => {
      if (!provinceIds.length) return;
      setDraft((prev) => {
        if (!prev) return prev;
        const next = cloneMatrix(prev);
        const current = viewCompare(next, roleId, slug);
        if (current === 'locked') return prev;
        setCompare(next, roleId, slug, provinceIds, current !== 'on');
        return next;
      });
    },
    [provinceIds, roleId]
  );

  const resetToApproved = useCallback(async () => {
    try {
      const doc = await ReportAccessService.getApprovedDocument();
      setApprovedDoc(cloneMatrix(doc));
      setDraft(cloneMatrix(doc));
      toast.message(
        'همه‌ی نقش‌ها به سند مصوب برگشتند؛ برای اعمال، ثبت کنید'
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'بازنشانی سند مصوب ناموفق بود.'
      );
    }
  }, []);

  const cancelChanges = useCallback(() => {
    if (!saved) return;
    setDraft(cloneMatrix(saved));
    toast.message('تغییرهای ثبت‌نشده لغو شد');
  }, [saved]);

  const openReview = useCallback(() => {
    if (!diffs.length) return;
    setReviewOpen(true);
  }, [diffs.length]);

  const closeReview = useCallback(() => {
    setReviewOpen(false);
  }, []);

  const confirmSave = useCallback(async () => {
    if (!draft || !diffs.length) return;
    setIsSaving(true);
    try {
      const n = diffs.length;
      const snapshot = await ReportAccessService.saveMatrix(draft);
      setSaved(cloneMatrix(snapshot.matrix));
      setDraft(cloneMatrix(snapshot.matrix));
      setReviewOpen(false);
      await queryClient.invalidateQueries({
        queryKey: DASHBOARD_QUERY.reportAccessSnapshot,
      });
      toast.success(
        `تغییرات ${toPersianDigits(n)} گزارش ثبت شد و روی منوی کاربران اعمال می‌شود`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'ثبت تغییرات دسترسی ناموفق بود.'
      );
    } finally {
      setIsSaving(false);
    }
  }, [draft, diffs.length, queryClient]);

  const provinceLabel = useCallback(
    (ids: string[]) => {
      if (!ids.length) return '—';
      if (ids.length === provinceIds.length) return 'همه استان‌ها';
      return ids.map((id) => provinceNames[id] ?? id).join('، ');
    },
    [provinceIds.length, provinceNames]
  );

  const formatDiffSummary = useCallback((items: ReportAccessDiff[]) => {
    let grants = 0;
    let revokes = 0;
    for (const d of items) {
      if (d.add.length) grants += 1;
      if (d.rem.length) revokes += 1;
    }
    return [
      grants ? `${toPersianDigits(grants)} مورد اعطای دسترسی` : '',
      revokes ? `${toPersianDigits(revokes)} مورد لغو دسترسی` : '',
    ]
      .filter(Boolean)
      .join(' و ');
  }, []);

  return {
    isLoading,
    isSaving,
    error,
    reload: load,
    saved,
    draft,
    provinceIds,
    roleId,
    setRoleId,
    diffs,
    dirtyRoleIds,
    matchesApproved,
    reviewOpen,
    openReview,
    closeReview,
    confirmSave,
    toggleReport,
    toggleCompare,
    resetToApproved,
    cancelChanges,
    provinceLabel,
    formatDiffSummary,
  };
}

export type ReportAccessPageModel = ReturnType<typeof useReportAccessPage>;

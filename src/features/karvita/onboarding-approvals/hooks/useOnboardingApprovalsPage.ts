'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { OnboardingApprovalsService } from '@/services/onboarding-approvals.service';
import type {
  ApprovalFilterTab,
  ApprovalRoleFilter,
  OnboardingApprovalUser,
} from '@/types/onboarding-approvals';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Page state for identity-doc review — filters, selection, approve/reject.
 */
export function useOnboardingApprovalsPage() {
  const [tab, setTab] = useState<ApprovalFilterTab>('pending_admin');
  const [query, setQuery] = useState('');
  const [province, setProvince] = useState('all');
  const [role, setRole] = useState<ApprovalRoleFilter>('all');
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const [users, setUsers] = useState<OnboardingApprovalUser[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);

  const selectedUser =
    users.find((user) => user.id === selectedId) ?? null;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      // Defer so setState is not synchronous in the effect body (React Compiler lint).
      await Promise.resolve();
      if (cancelled) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await OnboardingApprovalsService.listApprovals({
          status: tab,
          query: debouncedQuery,
          province,
          role,
        });
        if (cancelled) return;
        setUsers(result.users);
        setProvinces(result.provinces);
        setSelectedId((prev) =>
          prev && result.users.some((user) => user.id === prev) ? prev : null
        );
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : 'بارگذاری فهرست پرونده‌ها ناموفق بود.'
        );
        setUsers([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tab, debouncedQuery, province, role, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  const changeTab = useCallback((next: ApprovalFilterTab) => {
    setTab(next);
    setQuery('');
    setProvince('all');
    setRole('all');
    setSelectedId(null);
    setShowRejectForm(false);
    setRejectReason('');
  }, []);

  const selectUser = useCallback((user: OnboardingApprovalUser | null) => {
    setSelectedId(user?.id ?? null);
    setShowRejectForm(false);
    setRejectReason('');
  }, []);

  const toggleUser = useCallback((user: OnboardingApprovalUser) => {
    setSelectedId((prev) => (prev === user.id ? null : user.id));
    setShowRejectForm(false);
    setRejectReason('');
  }, []);

  const openDocPreview = useCallback((url: string) => {
    setDocPreviewUrl(url);
  }, []);

  const closeDocPreview = useCallback(() => {
    setDocPreviewUrl(null);
  }, []);

  const approveUser = useCallback(
    async (user: OnboardingApprovalUser) => {
      setActionBusy(true);
      try {
        await OnboardingApprovalsService.approveIdentityDoc(user.id);
        toast.success('وضعیت پرونده تغییر یافت و لیست سورت شد.');
        setSelectedId(null);
        setShowRejectForm(false);
        setRejectReason('');
        reload();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'تایید صلاحیت ناموفق بود.'
        );
      } finally {
        setActionBusy(false);
      }
    },
    [reload]
  );

  const submitReject = useCallback(
    async (user: OnboardingApprovalUser) => {
      if (!rejectReason.trim()) {
        toast.warning(
          'لطفاً علت نقص یا عدم تایید مدارک را بنویسید یا انتخاب کنید.'
        );
        return;
      }
      setActionBusy(true);
      try {
        await OnboardingApprovalsService.rejectIdentityDoc(
          user.id,
          rejectReason
        );
        toast.success('وضعیت پرونده تغییر یافت و لیست سورت شد.');
        setSelectedId(null);
        setShowRejectForm(false);
        setRejectReason('');
        reload();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'رد صلاحیت ناموفق بود.'
        );
      } finally {
        setActionBusy(false);
      }
    },
    [rejectReason, reload]
  );

  return {
    tab,
    changeTab,
    query,
    setQuery,
    province,
    setProvince,
    role,
    setRole,
    provinces,
    users,
    isLoading,
    error,
    reload,
    actionBusy,
    selectedUser,
    selectUser,
    toggleUser,
    showRejectForm,
    setShowRejectForm,
    rejectReason,
    setRejectReason,
    docPreviewUrl,
    openDocPreview,
    closeDocPreview,
    approveUser,
    submitReject,
  };
}

export type UseOnboardingApprovalsPageReturn = ReturnType<
  typeof useOnboardingApprovalsPage
>;

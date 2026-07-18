'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useOffsetLimitInfiniteList } from '@/hooks/useOffsetLimitInfiniteList';
import {
  ONBOARDING_APPROVALS_PAGE_SIZE,
  OnboardingApprovalsService,
} from '@/services/onboarding-approvals.service';
import type {
  ApprovalFilterTab,
  ApprovalRoleFilter,
  OnboardingApprovalUser,
} from '@/types/onboarding-approvals';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Page state for identity-doc review — paged via Facade (limit=10), same
 * infinite-list contract as org-structure admin tables.
 */
export function useOnboardingApprovalsPage() {
  const [tab, setTab] = useState<ApprovalFilterTab>('pending_admin');
  const [query, setQuery] = useState('');
  const [province, setProvince] = useState('all');
  const [role, setRole] = useState<ApprovalRoleFilter>('all');
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const [provinces, setProvinces] = useState<string[]>([]);
  const [actionBusy, setActionBusy] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);

  const resetKey = `${tab}::${debouncedQuery}::${province}::${role}`;

  const fetchPage = useCallback(
    async ({ offset, limit }: { offset: number; limit: number }) => {
      const page = await OnboardingApprovalsService.listPage({
        status: tab,
        query: debouncedQuery,
        province,
        role,
        offset,
        limit,
      });
      setProvinces(page.provinces);
      return {
        items: page.items,
        total: page.total,
        hasMore: page.hasMore,
      };
    },
    [tab, debouncedQuery, province, role]
  );

  const list = useOffsetLimitInfiniteList<OnboardingApprovalUser>({
    resetKey,
    fetchPage,
    pageSize: ONBOARDING_APPROVALS_PAGE_SIZE,
  });

  const {
    items,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMoreError,
    loadMore,
    reload,
    clearLoadMoreError,
  } = list;

  const selectedUser =
    items.find((user) => user.id === selectedId) ?? null;

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
        await reload();
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
        await reload();
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
    users: items,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMoreError,
    loadMore,
    reload,
    clearLoadMoreError,
    actionBusy,
    selectedUser,
    selectUser,
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

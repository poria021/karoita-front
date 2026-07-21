'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useOffsetLimitInfiniteList } from '@/hooks/useOffsetLimitInfiniteList';
import {
  ONBOARDING_APPROVALS_PAGE_SIZE,
  OnboardingApprovalsService,
} from '@/services/onboarding-approvals.service';
import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import type {
  ApprovalFilterTab,
  OnboardingApprovalUser,
} from '@/types/onboarding-approvals';

import {
  ONBOARDING_APPROVALS_CACHE_NAMESPACE,
  ONBOARDING_APPROVALS_CHROME_ID,
  ONBOARDING_APPROVALS_PROVINCES_KEY,
  onboardingApprovalsListResetKey,
} from '../lib/onboardingApprovalsListKeys';

const SEARCH_DEBOUNCE_MS = 300;

type OnboardingChrome = {
  tab: ApprovalFilterTab;
  query: string;
  province: string;
};

export function useOnboardingApprovalsPage() {
  const getChrome = useDashboardModuleCache((s) => s.getChrome);
  const setChrome = useDashboardModuleCache((s) => s.setChrome);
  const getData = useDashboardModuleCache((s) => s.getData);
  const setData = useDashboardModuleCache((s) => s.setData);
  const cachedChrome = getChrome<OnboardingChrome>(
    ONBOARDING_APPROVALS_CHROME_ID
  );

  const [tab, setTab] = useState<ApprovalFilterTab>(
    () => cachedChrome?.tab ?? 'pending_admin'
  );
  const [query, setQuery] = useState(() => cachedChrome?.query ?? '');
  const [province, setProvince] = useState(
    () => cachedChrome?.province ?? 'all'
  );
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const [provinces, setProvinces] = useState<string[]>(
    () => getData<string[]>(ONBOARDING_APPROVALS_PROVINCES_KEY) ?? []
  );
  const [actionBusy, setActionBusy] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const listQuery = query.trim() === '' ? '' : debouncedQuery;
  const resetKey = onboardingApprovalsListResetKey(tab, listQuery, province);

  useEffect(() => {
    setChrome<OnboardingChrome>(ONBOARDING_APPROVALS_CHROME_ID, {
      tab,
      query,
      province,
    });
  }, [tab, query, province, setChrome]);

  const fetchPage = useCallback(
    async ({ offset, limit }: { offset: number; limit: number }) => {
      const page = await OnboardingApprovalsService.listPage({
        status: tab,
        query: listQuery,
        province,
        offset,
        limit,
      });
      setProvinces(page.provinces);
      setData(ONBOARDING_APPROVALS_PROVINCES_KEY, page.provinces);
      return {
        items: page.items,
        total: page.total,
        hasMore: page.hasMore,
      };
    },
    [tab, listQuery, province, setData]
  );

  const list = useOffsetLimitInfiniteList<OnboardingApprovalUser>({
    resetKey,
    fetchPage,
    pageSize: ONBOARDING_APPROVALS_PAGE_SIZE,
    cacheNamespace: ONBOARDING_APPROVALS_CACHE_NAMESPACE,
  });

  const {
    items,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    isCold,
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
    setSelectedId(null);
    setShowRejectForm(false);
    setRejectReason('');
  }, []);

  const selectUser = useCallback((user: OnboardingApprovalUser | null) => {
    setSelectedId(user?.id ?? null);
    setShowRejectForm(false);
    setRejectReason('');
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
    provinces,
    users: items,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    isCold,
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
    approveUser,
    submitReject,
  };
}

export type UseOnboardingApprovalsPageReturn = ReturnType<
  typeof useOnboardingApprovalsPage
>;

'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useOffsetLimitInfiniteList } from '@/hooks/useOffsetLimitInfiniteList';
import {
  resolveListSearchQuery,
  SEARCH_DEBOUNCE_MS,
} from '@/lib/search-debounce';
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

  const listQuery = resolveListSearchQuery(query, debouncedQuery);
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
      return {
        items: page.items,
        total: page.total,
        hasMore: page.hasMore,
      };
    },
    [tab, listQuery, province]
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
    error,
    loadMoreError,
    loadMore,
    reload,
    clearLoadMoreError,
  } = list;

  useEffect(() => {
    let cancelled = false;
    void OnboardingApprovalsService.listProvinces()
      .then((next) => {
        if (cancelled || next.length === 0) return;
        setProvinces((prev) => {
          const isSame =
            prev.length === next.length &&
            prev.every((p, i) => p === next[i]);
          if (isSame) return prev;
          setData(ONBOARDING_APPROVALS_PROVINCES_KEY, next);
          return next;
        });
      })
      .catch(() => {
        /* filter chrome stays usable without province options */
      });
    return () => {
      cancelled = true;
    };
  }, [resetKey, setData]);

  useEffect(() => {
    return OnboardingApprovalsService.subscribeDirectoryChanges(() => {
      void reload();
    });
  }, [reload]);

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

  const handleLoadMore = useCallback(() => {
    void loadMore();
  }, [loadMore]);

  const handleRetryLoadMore = useCallback(() => {
    clearLoadMoreError();
    void loadMore();
  }, [clearLoadMoreError, loadMore]);

  const handleReload = useCallback(() => {
    void reload();
  }, [reload]);

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
    error,
    loadMoreError,
    loadMore: handleLoadMore,
    retryLoadMore: handleRetryLoadMore,
    reload: handleReload,
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

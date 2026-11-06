'use client';

import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { OnboardingApprovalsService } from '@/services/onboarding-approvals.service';
import type { ApprovalFilterTab } from '@/types/onboarding-approvals';

import {
  buildOnboardingApprovalsSummary,
  FAKE_ONBOARDING_PENDING_PREVIEW,
  ONBOARDING_DASHBOARD_PENDING_LIMIT,
  type OnboardingApprovalsSummary,
} from '../lib/onboarding-approvals-summary';

const STATUS_TABS = [
  'pending_admin',
  'approved',
  'rejected',
] as const satisfies readonly ApprovalFilterTab[];

export type DashboardOnboardingApprovalsState = {
  isLoading: boolean;
  isError: boolean;
  summary: OnboardingApprovalsSummary;
};

/**
 * خلاصهٔ صف تأیید مدارک برای میز کار مدیر ارشد —
 * شمار هر وضعیت + حداکثر ۱۰ پروندهٔ در انتظار.
 */
export function useDashboardOnboardingApprovals(): DashboardOnboardingApprovalsState {
  const queryClient = useQueryClient();

  useEffect(() => {
    return OnboardingApprovalsService.subscribeDirectoryChanges(() => {
      void queryClient.invalidateQueries({
        queryKey: ['onboarding-approvals', 'dashboard-summary'],
      });
    });
  }, [queryClient]);

  const queries = useQueries({
    queries: STATUS_TABS.map((status) => ({
      queryKey: DASHBOARD_QUERY.onboardingApprovalsSummary(status),
      queryFn: () =>
        OnboardingApprovalsService.listPage({
          status,
          offset: 0,
          limit:
            status === 'pending_admin'
              ? ONBOARDING_DASHBOARD_PENDING_LIMIT
              : 1,
        }),
      staleTime: QUERY_STALE_MS.list,
    })),
  });

  const dataKey = queries.map((query) => query.dataUpdatedAt).join('|');

  const summary = useMemo(() => {
    void dataKey;
    const pendingPage = queries[0]?.data;
    const approvedPage = queries[1]?.data;
    const rejectedPage = queries[2]?.data;

    const realPending = pendingPage?.items ?? [];
    // فعلاً برای دیدن استایل لیست؛ وقتی دادهٔ واقعی آمد fake را بردار.
    const pendingPreview =
      realPending.length > 0 ? realPending : FAKE_ONBOARDING_PENDING_PREVIEW;

    return buildOnboardingApprovalsSummary({
      counts: {
        pending_admin: Math.max(
          pendingPage?.total ?? 0,
          pendingPreview.length
        ),
        approved: approvedPage?.total ?? 0,
        rejected: rejectedPage?.total ?? 0,
      },
      pendingPreview,
    });
  }, [dataKey, queries]);

  const waitingForFirstPaint =
    queries.some((query) => query.isPending) &&
    summary.pendingPreview.length === 0 &&
    summary.total === 0;
  const hasAnyData = queries.some((query) => query.data != null);
  const allErrored = queries.every((query) => query.isError);

  return {
    isLoading: waitingForFirstPaint,
    isError: allErrored && !hasAnyData,
    summary,
  };
}

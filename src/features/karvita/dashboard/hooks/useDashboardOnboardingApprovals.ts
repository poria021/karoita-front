'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';
import { useEffect, useMemo } from 'react';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { OnboardingApprovalsService } from '@/services/onboarding-approvals.service';

import {
  buildOnboardingApprovalsSummary,
  ONBOARDING_DASHBOARD_PENDING_LIMIT,
  type OnboardingApprovalsSummary,
} from '../lib/onboarding-approvals-summary';

export type DashboardOnboardingApprovalsState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  summary: OnboardingApprovalsSummary;
};

/**
 * صف «در انتظار بررسی» میز کار مدیر ارشد — فقط حداکثر ۱۰ پروندهٔ در انتظار.
 * شمار هر وضعیت (نمودار) از `useDashboardDocumentsStatus` می‌آید.
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

  const query = useQuery({
    queryKey: DASHBOARD_QUERY.onboardingApprovalsSummary('pending_admin'),
    queryFn: () =>
      OnboardingApprovalsService.listPage({
        status: 'pending_admin',
        offset: 0,
        limit: ONBOARDING_DASHBOARD_PENDING_LIMIT,
      }),
    staleTime: QUERY_STALE_MS.list,
  });

  const summary = useMemo(() => {
    const pendingPreview = query.data?.items ?? [];
    return buildOnboardingApprovalsSummary({
      counts: {
        pending_admin: Math.max(query.data?.total ?? 0, pendingPreview.length),
        approved: 0,
        rejected: 0,
      },
      pendingPreview,
    });
  }, [query.data]);

  return {
    isLoading: query.isPending && !query.data,
    isError: query.isError && !query.data,
    isForbidden: isForbiddenError(query.error),
    summary,
  };
}

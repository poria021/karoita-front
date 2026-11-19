'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isForbiddenError } from '@/services/api-error';
import { useEffect, useMemo } from 'react';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { OnboardingApprovalsService } from '@/services/onboarding-approvals.service';
import { usersApi } from '@/services/users/users.api';

import {
  buildOnboardingApprovalsSummary,
  type OnboardingApprovalsSummary,
} from '../lib/onboarding-approvals-summary';

export type DashboardDocumentsStatusState = {
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  summary: OnboardingApprovalsSummary;
};

/**
 * شمار پرونده‌های مدارک (در انتظار / تأییدشده / ردشده) برای نمودار «وضعیت پرونده‌ها» —
 * فقط یک درخواست: `GET /api/v1/users/documents/status`
 * (به‌جای سه بار `listPage` با فیلتر وضعیت).
 */
export function useDashboardDocumentsStatus(): DashboardDocumentsStatusState {
  const queryClient = useQueryClient();

  useEffect(() => {
    return OnboardingApprovalsService.subscribeDirectoryChanges(() => {
      void queryClient.invalidateQueries({
        queryKey: DASHBOARD_QUERY.usersDocumentsStatus,
      });
    });
  }, [queryClient]);

  const query = useQuery({
    queryKey: DASHBOARD_QUERY.usersDocumentsStatus,
    queryFn: () => usersApi.documentsStatus(),
    staleTime: QUERY_STALE_MS.list,
  });

  const summary = useMemo(
    () =>
      buildOnboardingApprovalsSummary({
        counts: {
          pending_admin: query.data?.pending ?? 0,
          approved: query.data?.confirmed ?? 0,
          rejected: query.data?.rejected ?? 0,
        },
        pendingPreview: [],
      }),
    [query.data]
  );

  return {
    isLoading: query.isPending && !query.data,
    isError: query.isError && !query.data,
    isForbidden: isForbiddenError(query.error),
    summary,
  };
}

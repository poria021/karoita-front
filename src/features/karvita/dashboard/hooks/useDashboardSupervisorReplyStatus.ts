'use client';

import { useQuery } from '@tanstack/react-query';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';

import { loadSupervisorReplyStatus } from '../lib/load-supervisor-reply-status';
import {
  buildReplyStatusInsight,
  type EvaluationMonitorRole,
  type SupervisorReplyStatusSummary,
} from '../lib/supervisor-reply-status';

export type DashboardSupervisorReplyStatusState = {
  isLoading: boolean;
  isError: boolean;
  summary: SupervisorReplyStatusSummary | null;
  insight: { tone: SupervisorReplyStatusSummary['tone']; headline: string };
};

/** وضعیت مانیتورینگ گزارش‌های ترم باز برای میز کار ناظران ارزیابی. */
export function useDashboardSupervisorReplyStatus(
  role: EvaluationMonitorRole = 'supervisor_professor'
): DashboardSupervisorReplyStatusState {
  const query = useQuery({
    queryKey: DASHBOARD_QUERY.supervisorReplyStatus(role),
    queryFn: () => loadSupervisorReplyStatus(role),
    staleTime: QUERY_STALE_MS.module,
  });

  const summary = query.data ?? null;
  const insight = summary
    ? buildReplyStatusInsight(summary)
    : {
        tone: 'clear' as const,
        headline: 'هنوز گزارشی در چرخهٔ ارزیابی این ترم نیست',
      };

  return {
    isLoading: query.isPending,
    isError: query.isError,
    summary,
    insight,
  };
}

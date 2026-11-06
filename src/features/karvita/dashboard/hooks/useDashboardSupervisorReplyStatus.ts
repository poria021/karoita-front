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

/**
 * TEMP — دیتای فیک فقط برای پیش‌نمایش ظاهر باکس.
 * بعد از تأیید UI این فلگ و `TEMP_FAKE_REPLY_SUMMARY` را حذف کن.
 */
const USE_TEMP_FAKE_REPLY_STATUS = true;

const TEMP_FAKE_REPLY_SUMMARY: SupervisorReplyStatusSummary = {
  termId: 'fake-term',
  termTitle: 'نیم‌سال اول ۱۴۰۴–۱۴۰۵',
  pendingTotal: 55,
  answeredTotal: 72,
  total: 127,
  fillPercent: 57,
  tone: 'watch',
  courses: [
    {
      courseKey: 'intern2',
      courseTitle: 'کارورزی ۲',
      kind: 'internship',
      pending: 12,
      answered: 9,
      total: 21,
      fillPercent: 43,
      tone: 'critical',
    },
    {
      courseKey: 'intern4',
      courseTitle: 'کارورزی ۴',
      kind: 'internship',
      pending: 10,
      answered: 6,
      total: 16,
      fillPercent: 38,
      tone: 'critical',
    },
    {
      courseKey: 'intern1',
      courseTitle: 'کارورزی ۱',
      kind: 'internship',
      pending: 8,
      answered: 14,
      total: 22,
      fillPercent: 64,
      tone: 'critical',
    },
    {
      courseKey: 'appr2',
      courseTitle: 'کارآموزی ۲',
      kind: 'apprenticeship',
      pending: 7,
      answered: 7,
      total: 14,
      fillPercent: 50,
      tone: 'watch',
    },
    {
      courseKey: 'intern3',
      courseTitle: 'کارورزی ۳',
      kind: 'internship',
      pending: 5,
      answered: 10,
      total: 15,
      fillPercent: 67,
      tone: 'watch',
    },
    {
      courseKey: 'workshop-a',
      courseTitle: 'کارگاه تدریس',
      kind: 'internship',
      pending: 4,
      answered: 5,
      total: 9,
      fillPercent: 56,
      tone: 'watch',
    },
    {
      courseKey: 'appr1',
      courseTitle: 'کارآموزی ۱',
      kind: 'apprenticeship',
      pending: 3,
      answered: 8,
      total: 11,
      fillPercent: 73,
      tone: 'calm',
    },
    {
      courseKey: 'workshop-b',
      courseTitle: 'کارگاه سنجش',
      kind: 'internship',
      pending: 3,
      answered: 4,
      total: 7,
      fillPercent: 57,
      tone: 'calm',
    },
    {
      courseKey: 'project',
      courseTitle: 'پروژه پایانی',
      kind: 'internship',
      pending: 2,
      answered: 5,
      total: 7,
      fillPercent: 71,
      tone: 'calm',
    },
    {
      courseKey: 'observe',
      courseTitle: 'مشاهدهٔ مشارکتی',
      kind: 'apprenticeship',
      pending: 1,
      answered: 4,
      total: 5,
      fillPercent: 80,
      tone: 'calm',
    },
  ],
};

/** وضعیت مانیتورینگ گزارش‌های ترم باز برای میز کار ناظران ارزیابی. */
export function useDashboardSupervisorReplyStatus(
  role: EvaluationMonitorRole = 'supervisor_professor'
): DashboardSupervisorReplyStatusState {
  const query = useQuery({
    queryKey: DASHBOARD_QUERY.supervisorReplyStatus(role),
    queryFn: () => loadSupervisorReplyStatus(role),
    staleTime: QUERY_STALE_MS.module,
    enabled: !USE_TEMP_FAKE_REPLY_STATUS,
  });

  const summary = USE_TEMP_FAKE_REPLY_STATUS
    ? TEMP_FAKE_REPLY_SUMMARY
    : (query.data ?? null);
  const insight = summary
    ? buildReplyStatusInsight(summary)
    : {
        tone: 'clear' as const,
        headline: 'هنوز گزارشی در چرخهٔ ارزیابی این ترم نیست',
      };

  return {
    isLoading: USE_TEMP_FAKE_REPLY_STATUS ? false : query.isPending,
    isError: USE_TEMP_FAKE_REPLY_STATUS ? false : query.isError,
    summary,
    insight,
  };
}

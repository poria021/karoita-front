import {
  DAILY_APPROVALS_PAGE_SIZE,
  DailyApprovalsService,
} from '@/services/daily-approvals.service';
import type {
  DailyApprovalCourseKind,
  DailyApprovalTrainee,
} from '@/types/daily-approvals';

import {
  buildSupervisorReplyStatusSummary,
  mergeSupervisorReplyStatusSummaries,
  type EvaluationMonitorRole,
  type SupervisorReplyStatusSummary,
} from './supervisor-reply-status';

/** سقف صفحات برای میز کار تا حلقه بی‌نهایت نشود (۲۰ × ۱۰ = ۲۰۰ فراگیر). */
const MAX_DASHBOARD_PAGES = 10;

const MONITOR_KINDS = [
  'internship',
  'apprenticeship',
] as const satisfies readonly DailyApprovalCourseKind[];

async function loadAllTraineesForTerm(
  kind: DailyApprovalCourseKind,
  termId: string
): Promise<DailyApprovalTrainee[]> {
  const trainees: DailyApprovalTrainee[] = [];
  let offset = 0;

  for (let page = 0; page < MAX_DASHBOARD_PAGES; page += 1) {
    const result = await DailyApprovalsService.listPage({
      kind,
      query: '',
      readFilter: 'all',
      course: 'all',
      termId,
      offset,
      limit: DAILY_APPROVALS_PAGE_SIZE,
    });
    trainees.push(...result.items);
    if (!result.hasMore || result.items.length === 0) break;
    offset += result.items.length;
  }

  return trainees;
}

async function loadKindReplyStatus(
  kind: DailyApprovalCourseKind,
  role: EvaluationMonitorRole
): Promise<SupervisorReplyStatusSummary | null> {
  const terms = await DailyApprovalsService.listTerms(kind);
  const term = terms.find((item) => item.ended === false) ?? terms[0];
  if (!term) return null;

  const trainees = await loadAllTraineesForTerm(kind, term.id);
  return buildSupervisorReplyStatusSummary({
    termId: term.id,
    termTitle: term.title,
    trainees,
    role,
  });
}

/**
 * خلاصهٔ مانیتورینگ گزارش‌ها برای ترم باز —
 * هر دو پنل کارورزی/کارآموزی، بدون API جدید.
 */
export async function loadSupervisorReplyStatus(
  role: EvaluationMonitorRole = 'supervisor_professor'
): Promise<SupervisorReplyStatusSummary | null> {
  const parts = await Promise.all(
    MONITOR_KINDS.map((kind) => loadKindReplyStatus(kind, role))
  );
  return mergeSupervisorReplyStatusSummaries(parts);
}

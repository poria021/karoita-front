/**
 * گزارش هفتگی دانشجو — real mode.
 * طبق OpenAPI زندهٔ بک‌اند، `student-weeks/{id}/start`, `/submit`, `/submissions`
 * دیگر وجود ندارند (۴۰۴ «Cannot PATCH ...» — نه خطای کسب‌وکار، خطای نبودِ route).
 * گزارش دانشجو هم مثل بازخورد استاد/معلم/مدیر از همان مکانیزم گفتگوی هفته
 * می‌گذرد: `POST /conversations/{id}/messages` (ببین `real-daily-approvals-mutations.ts`).
 * پاسخ بدون بدنهٔ مفید است؛ نتیجه optimistic از ورودی ساخته می‌شود.
 */
import { requireNestTransport } from '@/services/require-nest-transport';
import { conversationsApi } from '@/services/conversations/real/conversations.api';
import { findWeekConversationId } from '@/services/daily-approvals/real/real-daily-approvals-conversations';
import type {
  InternshipWeeklySession,
  SaveWeeklyReportDraftInput,
  SubmitWeeklyReportInput,
} from '@/types/internship-enrollment';

function buildOptimisticWeekSession(
  input: SaveWeeklyReportDraftInput,
  status: InternshipWeeklySession['status']
): InternshipWeeklySession {
  return {
    id: input.weekId,
    title: '',
    status,
    score: null,
    text: input.text,
    files: input.files,
  };
}

export async function realSaveWeeklyReportDraft(
  input: SaveWeeklyReportDraftInput
): Promise<InternshipWeeklySession> {
  requireNestTransport('InternshipEnrollmentService.saveWeeklyReportDraft');
  const conversationId = await findWeekConversationId(
    input.enrollmentId,
    input.weekId
  );
  await conversationsApi.postMessage(conversationId, {
    text: input.text || undefined,
    fileIds: input.files.map((f) => f.id),
  });
  return buildOptimisticWeekSession(input, 'draft');
}

export async function realSubmitWeeklyReport(
  input: SubmitWeeklyReportInput
): Promise<InternshipWeeklySession> {
  requireNestTransport('InternshipEnrollmentService.submitWeeklyReport');
  const conversationId = await findWeekConversationId(
    input.enrollmentId,
    input.weekId
  );
  await conversationsApi.postMessage(conversationId, {
    text: input.text || undefined,
    fileIds: input.files.map((f) => f.id),
  });
  return buildOptimisticWeekSession(input, 'pending');
}

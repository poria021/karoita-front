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
import { isMongoObjectId } from '@/utils/mongoId';
import type {
  InternshipWeeklySession,
  SaveWeeklyReportDraftInput,
  SubmitWeeklyReportInput,
} from '@/types/internship-enrollment';

/**
 * پیش‌نویس‌های محلی (`localStorage`) ممکن است از قبل از اتصال به بک‌اند واقعی
 * باقی مانده باشند و آی‌دی فایل ساختگی (UUID) داشته باشند. Nest برای
 * `fileIds` فقط Mongo ObjectId قبول می‌کند وگرنه ۴۲۲ می‌دهد؛ آی‌دی‌های نامعتبر
 * را همین‌جا حذف می‌کنیم تا ارسال گزارش با یک فایل خراب کلاً بلاک نشود.
 */
function validFileIds(files: SaveWeeklyReportDraftInput['files']): string[] {
  return files.map((f) => f.id).filter(isMongoObjectId);
}

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
    fileIds: validFileIds(input.files),
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
    fileIds: validFileIds(input.files),
  });
  return buildOptimisticWeekSession(input, 'pending');
}

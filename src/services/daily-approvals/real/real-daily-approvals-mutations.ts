import { throwRealModeNotImplemented } from '@/lib/api-mode';
import { conversationsApi } from '@/services/conversations/real/conversations.api';
import { findWeekConversationId } from '@/services/daily-approvals/real/real-daily-approvals-conversations';
import { studentWeeksApi } from '@/services/internship-enrollment/real/student-weeks.api';
import { requireNestTransport } from '@/services/require-nest-transport';
import type {
  DailyApprovalCompetencyRating,
  UpdateDailyApprovalWeekInput,
  UpdateMentorDailyApprovalWeekInput,
  UpdatePrincipalDailyApprovalWeekInput,
} from '@/types/daily-approvals';

/**
 * mutationهای تأیید روزانه — بیشترشان در Nest هنوز به فرانت وصل نشده‌اند.
 * خواندن ترم/درس/هفته از capacities + syllabus است (در facade جدا).
 * استثنا `scoreRealDailyApprovalWeek` است — پایین همین فایل.
 */
export function assertDailyApprovalsMutationReady(surface: string): never {
  throwRealModeNotImplemented(surface);
}

/**
 * PATCH `/api/v1/conversations/{id}/read` — علامت‌زدن گفتگوی این هفته به‌عنوان
 * خوانده‌شده برای بازبین جاری (استاد/معلم/مدیر)، وقتی مودال نمره‌دهی باز می‌شود.
 * best-effort: نبودِ گفتگو یا خطای شبکه نباید مانع باز شدن مودال شود — قبلاً
 * این نقطه بدون شرط `throwRealModeNotImplemented` می‌زد و هر بار باز کردن
 * گزارش در real mode یک خطای غیرواقعی نشان می‌داد.
 */
export async function markRealDailyApprovalWeekOpened(input: {
  traineeId: string;
  weekId: string;
}): Promise<void> {
  requireNestTransport('DailyApprovalsService.openWeek');
  try {
    const conversationId = await findWeekConversationId(
      input.traineeId,
      input.weekId
    );
    await conversationsApi.markRead(conversationId);
  } catch {
    // best-effort
  }
}

/**
 * PATCH `/api/v1/student-weeks/{id}/score` — نمرهٔ عددی استاد راهنما (قبولی/بستن هفته).
 * `score: null` یعنی رد با بازخورد («نیازمند ویرایش») — طبق سناریوی محصول این
 * دو عمل متقابلاً منحصرند، پس اینجا نمره ثبت نمی‌شود، فقط بازخورد متنی استاد
 * روی `POST /conversations/{id}/messages` می‌رود؛ همان مکانیزمی که
 * `submitMentorFeedbackReal`/`submitPrincipalFeedbackReal` هم استفاده می‌کنند.
 * تشخیص «رد» دیگر با مقایسهٔ زمانِ پیام نیست — بک‌اند خودش `mentorStatus` را
 * `'send'` می‌کند و `mapWeekStatus` از همان فیلد (به‌همراه `status` کلی هفته)
 * رنگ کارت را مشتق می‌کند.
 * نقش استاد/دسترسی را خودِ Nest چک می‌کند (نه فرانت).
 */
export async function scoreRealDailyApprovalWeek(
  input: UpdateDailyApprovalWeekInput
): Promise<void> {
  requireNestTransport('DailyApprovalsService.updateWeekEvaluation');

  if (input.score !== null) {
    await studentWeeksApi.score(input.weekId, input.score);
    return;
  }

  const text = input.advisorFeedback.trim();
  if (!text) {
    throw new Error('برای رد گزارش بدون نمره، ثبت بازخورد متنی الزامی است.');
  }
  const conversationId = await findWeekConversationId(
    input.traineeId,
    input.weekId
  );
  await conversationsApi.postMessage(conversationId, { text });
}

/** ASCII '1'..'5' → عدد ۱ تا ۵ برای بدنهٔ `POST /conversations/{id}/messages`. */
function ratingToNumber(rating: DailyApprovalCompetencyRating): number {
  return Number(rating);
}

/**
 * POST `/api/v1/conversations/{id}/messages` — امتیاز شایستگی (۱ تا ۵) معلم
 * راهنما الزامی است، بازخورد متنی اختیاری. لایو تأیید شد بدنهٔ POST خودش
 * `rating` می‌گیرد، پس نیازی به endpoint جدا نیست.
 */
export async function submitMentorFeedbackReal(
  input: UpdateMentorDailyApprovalWeekInput
): Promise<void> {
  requireNestTransport('DailyApprovalsService.updateMentorWeekEvaluation');
  const text = input.mentorFeedback.trim();
  const conversationId = await findWeekConversationId(
    input.traineeId,
    input.weekId
  );
  await conversationsApi.postMessage(conversationId, {
    ...(text ? { text } : {}),
    rating: ratingToNumber(input.mentorRating),
  });
}

/**
 * POST `/api/v1/conversations/{id}/messages` — هم بازخورد توصیفی هم امتیاز
 * شایستگی (۱ تا ۵) مدیر مدرسه اختیاری‌اند؛ فقط ثبت هر دو با هم خالی مجاز نیست
 * (همین‌جا و در فرم اعتبارسنجی می‌شود).
 */
export async function submitPrincipalFeedbackReal(
  input: UpdatePrincipalDailyApprovalWeekInput
): Promise<void> {
  requireNestTransport('DailyApprovalsService.updatePrincipalWeekEvaluation');
  const text = input.principalFeedback.trim();
  if (!text && input.principalRating === null) {
    throw new Error('ثبت امتیاز یا بازخورد توصیفی مدیر مدرسه الزامی است.');
  }
  const conversationId = await findWeekConversationId(
    input.traineeId,
    input.weekId
  );
  await conversationsApi.postMessage(conversationId, {
    ...(text ? { text } : {}),
    ...(input.principalRating !== null
      ? { rating: ratingToNumber(input.principalRating) }
      : {}),
  });
}

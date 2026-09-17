import { conversationsApi } from '@/services/conversations/real/conversations.api';
import type { NestMessage } from '@/types/nest-conversations';

/**
 * گفتگوی مختص این هفته را پیدا می‌کند. Swagger برای `conversations` هیچ
 * `POST` ندارد — یعنی فرض بر این است که بک‌اند خودش هنگام ساخت
 * enrollment/هفته این گفتگو را می‌سازد (`type: "week"`, `weekId` = همین
 * student-week id). اگر پیدا نشد، به `general` (اگر باشد) برمی‌گردیم؛ در غیر
 * این صورت خطای صریح می‌دهیم به‌جای سکوت.
 * `enrollmentId` همان `traineeId` در ماژول daily-approvals است — ردیف‌های
 * `mentor/students` که آن صفحه می‌خواند، خودِ enrollment هستند (ببین
 * `mapRow` در `real-daily-approvals-reads.ts`).
 */
export async function findWeekConversationId(
  enrollmentId: string,
  weekId: string
): Promise<string> {
  const conversations = await conversationsApi.listByEnrollment(enrollmentId);
  const match =
    conversations.find((c) => c.weekId === weekId) ??
    conversations.find((c) => c.type === 'general');
  if (!match) {
    throw new Error(
      'گفتگوی مرتبط با این هفته روی سرور پیدا نشد — احتمالاً هنوز ساخته نشده است.'
    );
  }
  return match.id;
}

/**
 * پیام‌های گفتگوی یک هفته را best-effort می‌خواند — برای نمایش بازخورد قبلی
 * در مودال. اگر گفتگو هنوز نساخته شده یا خواندنش خطا بدهد، آرایهٔ خالی
 * برمی‌گرداند تا مودال بدون بازخورد قبلی هم باز شود (نه اینکه کل مودال بترکد).
 */
export async function loadWeekConversationMessages(
  enrollmentId: string,
  weekId: string
): Promise<NestMessage[]> {
  try {
    const conversationId = await findWeekConversationId(enrollmentId, weekId);
    return await conversationsApi.listMessages(conversationId);
  } catch {
    return [];
  }
}

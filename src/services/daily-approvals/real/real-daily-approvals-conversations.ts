import { conversationsApi } from '@/services/conversations/real/conversations.api';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
import { weekTemplateId } from '@/services/internship-enrollment/real/mappers/weekly-sessions';
import type { NestConversation, NestMessage } from '@/types/nest-conversations';
import type { NestStudentWeek } from '@/types/nest-student-enrollments';

/**
 * دو یا چند فراخوانِ هم‌زمان `findWeekConversationId` برای همان
 * `enrollmentId` (مثلاً `loadWeekDetail` + `openWeek` که با باز شدن مودال
 * نمره‌دهی پشت‌سرهم صدا زده می‌شوند) نباید هرکدام جدا `GET conversations` و
 * `GET weeks` بزنند. این کش فقط درخواستِ در-حالِ-پرواز را به فراخوان‌های
 * هم‌زمان بعدی می‌دهد؛ به‌محض settle شدن (موفق یا خطا) از کش پاک می‌شود، پس
 * هیچ دادهٔ بیات/کهنه‌ای برای فراخوان‌های بعدیِ غیرهم‌زمان سرو نمی‌شود.
 */
function dedupeInFlight<T>(
  cache: Map<string, Promise<T>>,
  key: string,
  load: () => Promise<T>
): Promise<T> {
  const existing = cache.get(key);
  if (existing) return existing;
  const promise = load().finally(() => {
    cache.delete(key);
  });
  cache.set(key, promise);
  return promise;
}

const inFlightConversationsByEnrollment = new Map<string, Promise<NestConversation[]>>();
const inFlightWeeksByEnrollment = new Map<string, Promise<NestStudentWeek[]>>();

/**
 * گفتگوی مختص این هفته را پیدا می‌کند. Swagger برای `conversations` هیچ
 * `POST` ندارد — یعنی فرض بر این است که بک‌اند خودش هنگام ساخت
 * enrollment/هفته این گفتگو را می‌سازد (`type: "week"`).
 *
 * لایو تأیید شد: `NestConversation.weekId` برابر با شناسهٔ *تعریفِ* هفته
 * (`week.weekId.id`) است، نه شناسهٔ رکورد هفتهٔ دانشجو (`studentWeekId`، پارامتر
 * دومِ این تابع) — قبلاً این دو با هم مقایسه می‌شدند و هیچ‌وقت match نمی‌داد، پس
 * همه‌چیز اشتباهاً می‌افتاد روی fallback گفتگوی `general` (همهٔ هفته‌ها روی یک
 * گفتگوی مشترک). برای پیدا کردن `weekId` درست، رکورد هفتهٔ دانشجو را هم لازم
 * داریم — یا با `knownWeeks` (اگر فراخوان از قبل `GET .../weeks` را زده) یا با
 * یک `GET .../weeks` تازه اینجا.
 *
 * `enrollmentId` همان `traineeId` در ماژول daily-approvals است — ردیف‌های
 * `mentor/students` که آن صفحه می‌خواند، خودِ enrollment هستند (ببین
 * `mapRow` در `real-daily-approvals-reads.ts`).
 */
export async function findWeekConversationId(
  enrollmentId: string,
  studentWeekId: string,
  knownWeeks?: readonly NestStudentWeek[]
): Promise<string> {
  const [conversations, weeks] = await Promise.all([
    dedupeInFlight(inFlightConversationsByEnrollment, enrollmentId, () =>
      conversationsApi.listByEnrollment(enrollmentId)
    ),
    knownWeeks
      ? Promise.resolve(knownWeeks)
      : dedupeInFlight(inFlightWeeksByEnrollment, enrollmentId, () =>
          studentEnrollmentsApi.listWeeks(enrollmentId)
        ),
  ]);

  const week = weeks.find((w) => (w.id ?? w._id) === studentWeekId);
  const templateId = week ? weekTemplateId(week) : null;

  const match =
    (templateId ? conversations.find((c) => c.weekId === templateId) : undefined) ??
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
 * `knownWeeks`: وقتی فراخوان (مثل حلقهٔ هفته‌های یک enrollment) از قبل
 * `GET .../weeks` را زده، همان را پاس بده تا `findWeekConversationId` دوباره
 * نگیردش.
 */
export async function loadWeekConversationMessages(
  enrollmentId: string,
  weekId: string,
  knownWeeks?: readonly NestStudentWeek[]
): Promise<NestMessage[]> {
  try {
    const conversationId = await findWeekConversationId(enrollmentId, weekId, knownWeeks);
    return await conversationsApi.listMessages(conversationId);
  } catch {
    return [];
  }
}

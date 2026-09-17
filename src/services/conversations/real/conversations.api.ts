/**
 * HTTP گفتگو/بازخورد. مسیر نسبت به `NEXT_PUBLIC_API_URL` (`.../api`) است.
 * Swagger هیچ `POST /api/v1/conversations` ندارد — گفتگو باید از قبل روی
 * سرور وجود داشته باشد (ببین `findWeekConversationId` در
 * `real-daily-approvals-mutations.ts`)؛ این لایه فقط پیدا/خواندن/نوشتن پیام
 * را پوشش می‌دهد، نه ساختن گفتگوی جدید.
 */
import { apiClient } from '@/services/api-client';
import { toSearchParams } from '@/services/nest-search-params';
import type {
  NestConversation,
  NestCreateMessageDto,
  NestMessage,
  NestMessageListResponse,
} from '@/types/nest-conversations';

export const NEST_CONVERSATIONS_PATHS = {
  list: 'v1/conversations',
  messages: (id: string) => `v1/conversations/${id}/messages`,
  read: (id: string) => `v1/conversations/${id}/read`,
} as const;

/** حفاظ در برابر حلقهٔ بی‌پایان اگر بک‌اند همیشه `hasNextPage: true` برگرداند. */
const CONVERSATION_MESSAGES_MAX_PAGES = 50;

export const conversationsApi = {
  /** GET /api/v1/conversations?enrollmentId= — فقط گفتگوهای کاربر جاری. */
  async listByEnrollment(enrollmentId: string): Promise<NestConversation[]> {
    const raw = await apiClient.getJson<unknown>(
      NEST_CONVERSATIONS_PATHS.list,
      undefined,
      { searchParams: toSearchParams({ enrollmentId }) }
    );
    return Array.isArray(raw) ? (raw as NestConversation[]) : [];
  },

  /**
   * GET /api/v1/conversations/{id}/messages — همهٔ صفحه‌ها را با `afterSequence`
   * جمع می‌کند (نه فقط صفحهٔ اول) چون ترتیب پیش‌فرض تضمین‌شده نیست که جدیدترین
   * پیام (بازخورد آخر) در همان صفحهٔ اول باشد.
   */
  async listMessages(conversationId: string): Promise<NestMessage[]> {
    const collected: NestMessage[] = [];
    let afterSequence: number | undefined;
    for (let page = 0; page < CONVERSATION_MESSAGES_MAX_PAGES; page += 1) {
      const raw = await apiClient.getJson<NestMessageListResponse>(
        NEST_CONVERSATIONS_PATHS.messages(conversationId),
        undefined,
        { searchParams: toSearchParams({ afterSequence }) }
      );
      const pageData = raw?.data ?? [];
      collected.push(...pageData);
      if (!raw?.hasNextPage || pageData.length === 0) break;
      afterSequence = pageData[pageData.length - 1]?.sequence;
    }
    return collected;
  },

  /** POST /api/v1/conversations/{id}/messages — `CreateContentDto`؛ ۲۰۱ بدون بدنهٔ مفید. */
  postMessage(
    conversationId: string,
    body: NestCreateMessageDto
  ): Promise<unknown> {
    return apiClient.postMaybeJson<unknown>(
      NEST_CONVERSATIONS_PATHS.messages(conversationId),
      body
    );
  },

  /** PATCH /api/v1/conversations/{id}/read — بدنه ندارد. */
  markRead(conversationId: string): Promise<unknown> {
    return apiClient.patchMaybeJson<unknown>(
      NEST_CONVERSATIONS_PATHS.read(conversationId),
      {}
    );
  },
};

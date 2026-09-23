/**
 * HTTP اعلان هدر. مسیر نسبت به `NEXT_PUBLIC_API_URL` (`.../api`) است —
 * دوباره `api/` نگذار وگرنه rewrite می‌شود `/api/api/v1/...`.
 * PATCH خوانده‌شدن در Swagger بدنه ندارد.
 */
import { apiClient } from '@/services/api-client';
import { toSearchParams } from '@/services/nest-search-params';
import {
  mapNestNotification,
  parseNotificationsListResponse,
} from '@/services/notifications/real/notifications.mappers';
import type { AppNotification, NestNotification } from '@/types/notifications';

export const NEST_NOTIFICATIONS_PATHS = {
  list: 'v1/notifications',
  markRead: (id: string) => `v1/notifications/${id}/read`,
} as const;

export const NOTIFICATIONS_PAGE_SIZE = 10;
export const NOTIFICATIONS_MAX_TOTAL = 20;

export type ListNotificationsQuery = {
  page?: number;
  limit?: number;
};

export type NotificationsPage = {
  data: AppNotification[];
  hasNextPage: boolean;
};

export const notificationsApi = {
  async list(query: ListNotificationsQuery = {}): Promise<NotificationsPage> {
    const raw = await apiClient.getJson<unknown>(
      NEST_NOTIFICATIONS_PATHS.list,
      undefined,
      {
        searchParams: toSearchParams({
          page: query.page,
          limit: query.limit,
        }),
      }
    );
    const parsed = parseNotificationsListResponse(raw);
    return {
      data: parsed.data.map(mapNestNotification).filter((item) => item.id),
      hasNextPage: parsed.hasNextPage,
    };
  },

  /**
   * `PATCH /api/v1/notifications/{id}/read`.
   * Swagger ردیف ۲۰۰ می‌دهد؛ بعضی کپی‌ها ۲۰۴ — آن‌وقت `null`.
   */
  async markAsRead(id: string): Promise<AppNotification | null> {
    const raw = await apiClient.patchMaybeJson<NestNotification>(
      NEST_NOTIFICATIONS_PATHS.markRead(id),
      {},
      undefined
    );
    if (!raw) return null;
    return mapNestNotification(raw);
  },
};

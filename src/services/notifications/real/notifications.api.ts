/**
 * Real Nest calls for header notifications.
 *
 * Relative to NEXT_PUBLIC_API_URL (`.../api`), same as users/auth —
 * never prefix `api/` again or the rewrite becomes `/api/api/v1/...`.
 *
 * GET   /api/v1/notifications?page=&limit=
 * PATCH /api/v1/notifications/{id}/read  (no request body in Swagger)
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

export const NOTIFICATIONS_PAGE_SIZE = 20;

export type ListNotificationsQuery = {
  page?: number;
  limit?: number;
};

export type NotificationsPage = {
  data: AppNotification[];
  hasNextPage: boolean;
};

export const notificationsApi = {
  /** GET /api/v1/notifications */
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
   * PATCH /api/v1/notifications/{id}/read
   * Swagger 200 returns the row; some copies answer 204 — then `null`.
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

/**
 * Real Nest API calls for notifications.
 *
 * GET   /api/v1/notifications?page=&limit=
 * PATCH /api/v1/notifications/:id/read
 */
import { apiClient } from '@/services/api-client';
import { toSearchParams } from '@/services/nest-search-params';
import type {
  AppNotification,
  NestNotification,
  NotificationsListResponse,
} from '@/types/notifications';
import { mapNestNotification } from '@/types/notifications';

const BASE = 'api/v1/notifications';

export type ListNotificationsQuery = {
  page?: number;
  limit?: number;
};

/** GET /api/v1/notifications */
export async function apiListNotifications(
  query: ListNotificationsQuery = {}
): Promise<{ data: AppNotification[]; hasNextPage: boolean }> {
  const raw = await apiClient.getJson<NotificationsListResponse>(BASE, undefined, {
    searchParams: toSearchParams({
      page: query.page,
      limit: query.limit,
    }),
  });

  return {
    data: raw.data.map(mapNestNotification),
    hasNextPage: raw.hasNextPage,
  };
}

/** PATCH /api/v1/notifications/:id/read */
export async function apiMarkNotificationAsRead(
  id: string
): Promise<AppNotification> {
  const raw = await apiClient.patchJson<NestNotification>(
    `${BASE}/${id}/read`,
    {}
  );
  return mapNestNotification(raw);
}

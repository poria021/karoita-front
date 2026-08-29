import { isMockApiMode } from '@/lib/api-mode';
import {
  NOTIFICATIONS_PAGE_SIZE,
  notificationsApi,
  type ListNotificationsQuery,
  type NotificationsPage,
} from '@/services/notifications/real/notifications.api';
import {
  markAllMockNotificationsAsRead,
  markMockNotificationAsRead,
  readMockNotifications,
} from '@/services/notifications/mock/mock-notifications.store';
import type { AppNotification } from '@/types/notifications';

const MARK_ALL_PAGE_SIZE = 50;
const MARK_ALL_MAX_PAGES = 40;
const MARK_ALL_PATCH_CHUNK = 8;

async function mapInChunks(
  ids: string[],
  chunkSize: number,
  fn: (id: string) => Promise<unknown>
): Promise<void> {
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    await Promise.all(chunk.map(fn));
  }
}

/**
 * Header notification chrome.
 *
 * Nest:
 * - GET   /api/v1/notifications?page=&limit=
 * - PATCH /api/v1/notifications/{id}/read
 * Bulk mark-all does not exist — real pages GET then PATCHes unread ids.
 */
export class NotificationsService {
  /** Sync hydrate for header chrome — mock only; real returns [] until first fetch. */
  static getSnapshot(): AppNotification[] {
    if (!isMockApiMode()) return [];
    return readMockNotifications();
  }

  /**
   * GET /api/v1/notifications
   * Default page 1 / limit 20 matches header chrome.
   */
  static async list(
    query: ListNotificationsQuery = { page: 1, limit: NOTIFICATIONS_PAGE_SIZE }
  ): Promise<AppNotification[]> {
    const page = await NotificationsService.listPaginated(query);
    return page.data;
  }

  /** GET /api/v1/notifications — envelope for infinite scroll. */
  static async listPaginated(
    query: ListNotificationsQuery = {}
  ): Promise<NotificationsPage> {
    if (isMockApiMode()) {
      return { data: readMockNotifications(), hasNextPage: false };
    }
    return notificationsApi.list(query);
  }

  /**
   * PATCH /api/v1/notifications/{id}/read
   * Returns the Nest row when present; `null` on empty/204 so the store can
   * flip `read` locally without wiping the loaded pages.
   */
  static async markAsRead(
    notificationId: string
  ): Promise<AppNotification | null> {
    if (isMockApiMode()) {
      const list = markMockNotificationAsRead(notificationId);
      return list.find((item) => item.id === notificationId) ?? null;
    }
    return notificationsApi.markAsRead(notificationId);
  }

  /**
   * Mark every unread notification as read.
   * Real: walk GET pages (no unread filter on Nest), PATCH each unread id,
   * then return page 1 for the header.
   */
  static async markAllAsRead(): Promise<NotificationsPage> {
    if (isMockApiMode()) {
      return {
        data: markAllMockNotificationsAsRead(),
        hasNextPage: false,
      };
    }

    const unreadIds: string[] = [];
    let page = 1;
    for (let i = 0; i < MARK_ALL_MAX_PAGES; i += 1) {
      const result = await notificationsApi.list({
        page,
        limit: MARK_ALL_PAGE_SIZE,
      });
      for (const item of result.data) {
        if (!item.read) unreadIds.push(item.id);
      }
      if (!result.hasNextPage) break;
      page += 1;
    }

    await mapInChunks(unreadIds, MARK_ALL_PATCH_CHUNK, (id) =>
      notificationsApi.markAsRead(id)
    );

    return notificationsApi.list({
      page: 1,
      limit: NOTIFICATIONS_PAGE_SIZE,
    });
  }
}

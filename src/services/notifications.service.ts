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
 * اعلان هدر. Nest bulk mark-all ندارد — real صفحات GET را می‌گردد و unread را PATCH می‌کند.
 */
export class NotificationsService {
  /** hydrate همزمان فقط mock؛ real تا اولین fetch خالی است. */
  static getSnapshot(): AppNotification[] {
    if (!isMockApiMode()) return [];
    return readMockNotifications();
  }

  static async list(
    query: ListNotificationsQuery = { page: 1, limit: NOTIFICATIONS_PAGE_SIZE }
  ): Promise<AppNotification[]> {
    const page = await NotificationsService.listPaginated(query);
    return page.data;
  }

  static async listPaginated(
    query: ListNotificationsQuery = {}
  ): Promise<NotificationsPage> {
    if (isMockApiMode()) {
      return { data: readMockNotifications(), hasNextPage: false };
    }
    return notificationsApi.list(query);
  }

  /**
   * `PATCH /api/v1/notifications/{id}/read`.
   * پاسخ خالی/204 یعنی `null` تا store بدون پاک کردن صفحات `read` را عوض کند.
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
   * Nest فیلتر unread ندارد — صفحات GET را می‌گردیم، unread را PATCH، بعد صفحهٔ ۱ هدر.
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

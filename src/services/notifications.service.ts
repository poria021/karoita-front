import { isMockApiMode } from '@/lib/api-mode';
import {
  apiListNotifications,
  apiMarkNotificationAsRead,
  type ListNotificationsQuery,
} from '@/services/notifications/notifications.api';
import {
  markAllMockNotificationsAsRead,
  markMockNotificationAsRead,
  readMockNotifications,
} from '@/services/notifications/mock-notifications.store';
import type { AppNotification } from '@/types/notifications';

/**
 * Header notification chrome.
 *
 * Nest map:
 * - GET   /api/v1/notifications
 * - PATCH /api/v1/notifications/:id/read
 */
export class NotificationsService {
  /** Sync hydrate for header chrome — mock only; real returns [] until first fetch. */
  static getSnapshot(): AppNotification[] {
    if (!isMockApiMode()) return [];
    return readMockNotifications();
  }

  /**
   * GET /api/v1/notifications
   * Returns flat list; real mode fetches page 1 with limit 20 for header chrome.
   */
  static async list(
    query: ListNotificationsQuery = { page: 1, limit: 20 }
  ): Promise<AppNotification[]> {
    if (isMockApiMode()) {
      return readMockNotifications();
    }
    const result = await apiListNotifications(query);
    return result.data;
  }

  /**
   * GET /api/v1/notifications — returns full paginated response (for infinite scroll).
   */
  static async listPaginated(
    query: ListNotificationsQuery = {}
  ): Promise<{ data: AppNotification[]; hasNextPage: boolean }> {
    if (isMockApiMode()) {
      return { data: readMockNotifications(), hasNextPage: false };
    }
    return apiListNotifications(query);
  }

  /** PATCH /api/v1/notifications/:id/read */
  static async markAsRead(notificationId: string): Promise<AppNotification[]> {
    if (isMockApiMode()) {
      return markMockNotificationAsRead(notificationId);
    }
    // Real: patch the single item, then re-fetch to get fresh list.
    await apiMarkNotificationAsRead(notificationId);
    return NotificationsService.list();
  }

  /**
   * Mark all as read — mock has a bulk endpoint; real iterates visible items.
   * Backend does not expose POST /mark-all-read yet; we patch items client-side.
   */
  static async markAllAsRead(): Promise<AppNotification[]> {
    if (isMockApiMode()) {
      return markAllMockNotificationsAsRead();
    }
    // Real: fetch current unread list, then patch each one in parallel.
    const current = await NotificationsService.list();
    const unread = current.filter((n) => !n.read);
    await Promise.all(unread.map((n) => apiMarkNotificationAsRead(n.id)));
    return NotificationsService.list();
  }
}

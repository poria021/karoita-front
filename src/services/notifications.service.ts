import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
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
 * - GET   /notifications
 * - PATCH /notifications/:id/read
 * - POST  /notifications/mark-all-read
 */
export class NotificationsService {
  /** Sync hydrate for header chrome — mock only; real returns [] until wired */
  static getSnapshot(): AppNotification[] {
    if (!isMockApiMode()) return [];
    return readMockNotifications();
  }

  /** GET /notifications */
  static async list(): Promise<AppNotification[]> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('NotificationsService.list');
    }
    return readMockNotifications();
  }

  /** PATCH /notifications/:id/read */
  static async markAsRead(
    notificationId: string
  ): Promise<AppNotification[]> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('NotificationsService.markAsRead');
    }
    return markMockNotificationAsRead(notificationId);
  }

  /** POST /notifications/mark-all-read */
  static async markAllAsRead(): Promise<AppNotification[]> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('NotificationsService.markAllAsRead');
    }
    return markAllMockNotificationsAsRead();
  }
}

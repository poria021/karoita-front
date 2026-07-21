import { isMockApiMode, throwRealModeNotImplemented } from '@/lib/api-mode';
import {
  markAllMockNotificationsAsRead,
  markMockNotificationAsRead,
  readMockNotifications,
} from '@/services/notifications/mock-notifications.store';
import type { AppNotification } from '@/types/notifications';

/**
 * Facade اعلان‌های هدر (chrome).
 *
 * MOCK → REAL swap map
 * - list / getSnapshot     →  GET  /notifications
 * - markAsRead             →  PATCH /notifications/:id/read
 * - markAllAsRead          →  POST  /notifications/mark-all-read
 */
export class NotificationsService {
  /** Sync snapshot for client chrome hydrate (mock only; real returns []). */
  static getSnapshot(): AppNotification[] {
    if (!isMockApiMode()) return [];
    return readMockNotifications();
  }

  static async list(): Promise<AppNotification[]> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('NotificationsService.list');
    }
    return readMockNotifications();
  }

  static async markAsRead(
    notificationId: string
  ): Promise<AppNotification[]> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('NotificationsService.markAsRead');
    }
    return markMockNotificationAsRead(notificationId);
  }

  static async markAllAsRead(): Promise<AppNotification[]> {
    if (!isMockApiMode()) {
      throwRealModeNotImplemented('NotificationsService.markAllAsRead');
    }
    return markAllMockNotificationsAsRead();
  }
}

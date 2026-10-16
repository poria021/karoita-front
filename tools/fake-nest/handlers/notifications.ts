/** اعلان‌های هدر: لیست صفحه‌بندی‌شده و علامت خوانده‌شدن برای کاربر جاری. */
import { HttpError, ok } from '../http';
import type { Router } from '../router';
import { paginate, type Store, type StoredNotification } from '../store';

function notificationDto(row: StoredNotification, accountId: string | undefined) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    audience: 'all',
    targetRoles: null,
    userId: null,
    readByUserIds: row.readByUserIds,
    metadata: null,
    isRead: accountId ? row.readByUserIds.includes(accountId) : false,
    createdAt: row.createdAt,
    updatedAt: row.createdAt,
  };
}

export function registerNotificationRoutes(router: Router, store: Store): void {
  router.register('get', '/api/v1/notifications', (context) => {
    const accountId = context.session?.accountId;
    const page = paginate(store.notifications, context.query);
    return ok({
      data: page.data.map((row) => notificationDto(row, accountId)),
      hasNextPage: page.hasNextPage,
    });
  });

  router.register('patch', '/api/v1/notifications/{id}/read', (context) => {
    const row = store.notifications.find((item) => item.id === context.params.id);
    if (!row) throw new HttpError(404, 'Notification not found');
    const accountId = context.session?.accountId;
    if (accountId && !row.readByUserIds.includes(accountId)) {
      row.readByUserIds.push(accountId);
    }
    return ok(notificationDto(row, accountId));
  });
}

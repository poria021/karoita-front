/**
 * اعلان‌ها — شکل فرانت در برابر DTO Nest.
 * GET `/api/v1/notifications` → `{ data, hasNextPage }`؛
 * PATCH `/api/v1/notifications/:id/read` → `NestNotification`.
 * mapper در `services/notifications/real/` است تا quirk Nest به UI نرسد.
 */

/** ردیف خام Nest (تگ Swagger Notifications). */
export type NestNotificationAudience = 'all' | 'role' | 'user' | string;

export type NestNotification = {
  id: string;
  title: string;
  body: string;
  audience: NestNotificationAudience;
  targetRoles: string[];
  userId: string | null;
  readByUserIds: string[];
  metadata: string | null;
  /** سمت بک‌اند برای کاربر جاری مشتق می‌شود. */
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsListResponse = {
  data: NestNotification[];
  hasNextPage: boolean;
};

export type AppNotificationKind = 'message' | 'system';

export type AppNotification = {
  id: string;
  kind: AppNotificationKind;
  title: string;
  body?: string;
  senderLabel?: string;
  createdAt: string;
  read: boolean;
};

export function isExpandableNotification(
  notification: AppNotification
): boolean {
  return Boolean(notification.body?.trim());
}

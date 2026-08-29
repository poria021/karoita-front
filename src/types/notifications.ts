/**
 * Notification types — FE shape vs Nest DTO.
 *
 * GET  /api/v1/notifications  → { data, hasNextPage }
 * PATCH /api/v1/notifications/:id/read → NestNotification
 *
 * Mapper lives in `services/notifications/real/` so Nest quirks stay out of UI.
 */

/** Raw row from Nest (Swagger Notifications tag). */
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
  /** Derived on the backend per current user. */
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

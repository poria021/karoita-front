/**
 * Notification types — aligned with Nest API schema.
 *
 * GET  /api/v1/notifications  → NotificationsListResponse
 * PATCH /api/v1/notifications/:id/read → NestNotification
 */

/** Raw shape returned by the Nest backend. */
export type NestNotification = {
  id: string;
  title: string;
  body: string;
  audience: 'all' | 'role' | 'user';
  targetRoles: string[];
  userId: string | null;
  readByUserIds: string[];
  metadata: string | null;
  /** Derived on the backend per-user — true when current user has read it. */
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsListResponse = {
  data: NestNotification[];
  hasNextPage: boolean;
};

// ─── App-level shape (used by store + UI) ────────────────────────────────────

export type AppNotificationKind = 'message' | 'system';

export type AppNotification = {
  id: string;
  kind: AppNotificationKind;
  title: string;
  body?: string;
  /** Populated from targetRoles or userId context. */
  senderLabel?: string;
  createdAt: string;
  read: boolean;
};

// ─── Mapper ──────────────────────────────────────────────────────────────────

export function mapNestNotification(n: NestNotification): AppNotification {
  return {
    id: n.id,
    kind: n.targetRoles.length > 0 || n.audience === 'role' ? 'system' : 'message',
    title: n.title,
    body: n.body || undefined,
    createdAt: n.createdAt,
    read: n.isRead,
  };
}

export function isExpandableNotification(
  notification: AppNotification
): boolean {
  void notification;
  return false;
}

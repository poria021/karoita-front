import type {
  AppNotification,
  NestNotification,
  NotificationsListResponse,
} from '@/types/notifications';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

/**
 * پاکت لیست Nest `{ data, hasNextPage }` است. بعضی کپی‌ها `data` ندارند یا آرایهٔ خام می‌دهند —
 * hydrate کروم نباید throw کند.
 */
export function parseNotificationsListResponse(
  raw: unknown
): NotificationsListResponse {
  if (Array.isArray(raw)) {
    return {
      data: raw.filter(isRecord).map((row) => row as unknown as NestNotification),
      hasNextPage: false,
    };
  }
  if (!isRecord(raw)) {
    return { data: [], hasNextPage: false };
  }
  const rows = Array.isArray(raw.data) ? raw.data : [];
  return {
    data: rows.filter(isRecord).map((row) => row as unknown as NestNotification),
    hasNextPage: Boolean(raw.hasNextPage),
  };
}

export function mapNestNotification(n: NestNotification): AppNotification {
  const targetRoles = asStringArray(n.targetRoles);
  const audience = asString(n.audience);
  const body = asString(n.body).trim();

  return {
    id: asString(n.id),
    kind: targetRoles.length > 0 || audience === 'role' ? 'system' : 'message',
    title: asString(n.title),
    body: body || undefined,
    createdAt: asString(n.createdAt),
    read: Boolean(n.isRead),
  };
}

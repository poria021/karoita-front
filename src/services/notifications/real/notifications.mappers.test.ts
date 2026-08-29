import { describe, expect, it } from 'vitest';

import {
  mapNestNotification,
  parseNotificationsListResponse,
} from '@/services/notifications/real/notifications.mappers';
import type { NestNotification } from '@/types/notifications';

const nestRow = (overrides: Partial<NestNotification> = {}): NestNotification => ({
  id: 'ntf-1',
  title: 'مهلت تمدید شد',
  body: 'تا پنجشنبه فرصت دارید.',
  audience: 'all',
  targetRoles: [],
  userId: null,
  readByUserIds: [],
  metadata: null,
  isRead: false,
  createdAt: '2026-08-29T14:06:42.816Z',
  updatedAt: '2026-08-29T14:06:42.816Z',
  ...overrides,
});

describe('parseNotificationsListResponse', () => {
  it('reads the Swagger envelope { data, hasNextPage }', () => {
    const parsed = parseNotificationsListResponse({
      data: [nestRow({ id: 'a' })],
      hasNextPage: true,
    });
    expect(parsed.data).toHaveLength(1);
    expect(parsed.hasNextPage).toBe(true);
  });

  it('treats a bare array as a finished page', () => {
    const parsed = parseNotificationsListResponse([nestRow({ id: 'a' })]);
    expect(parsed.data[0]?.id).toBe('a');
    expect(parsed.hasNextPage).toBe(false);
  });

  it('does not throw on empty or malformed payloads', () => {
    expect(parseNotificationsListResponse(null)).toEqual({
      data: [],
      hasNextPage: false,
    });
    expect(parseNotificationsListResponse({})).toEqual({
      data: [],
      hasNextPage: false,
    });
  });
});

describe('mapNestNotification', () => {
  it('maps isRead → read and keeps body', () => {
    expect(mapNestNotification(nestRow({ isRead: true }))).toMatchObject({
      id: 'ntf-1',
      title: 'مهلت تمدید شد',
      body: 'تا پنجشنبه فرصت دارید.',
      read: true,
      kind: 'message',
      createdAt: '2026-08-29T14:06:42.816Z',
    });
  });

  it('marks role-targeted rows as system', () => {
    expect(
      mapNestNotification(
        nestRow({ audience: 'role', targetRoles: ['student'] })
      ).kind
    ).toBe('system');
  });

  it('omits blank body', () => {
    expect(mapNestNotification(nestRow({ body: '  ' })).body).toBeUndefined();
  });
});

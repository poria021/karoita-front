import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notificationsApi } from '@/services/notifications/real/notifications.api';
import { NEST_NOTIFICATIONS_PATHS } from '@/services/notifications/real/notifications.api';

const getJson = vi.fn();
const patchMaybeJson = vi.fn();

vi.mock('@/services/api-client', () => ({
  apiClient: {
    getJson: (...args: unknown[]) => getJson(...args),
    patchMaybeJson: (...args: unknown[]) => patchMaybeJson(...args),
  },
}));

describe('notificationsApi', () => {
  beforeEach(() => {
    getJson.mockReset();
    patchMaybeJson.mockReset();
  });

  it('GETs v1/notifications with page and limit (not api/v1/...)', async () => {
    getJson.mockResolvedValue({
      data: [
        {
          id: '1',
          title: 't',
          body: 'b',
          audience: 'all',
          targetRoles: [],
          userId: null,
          readByUserIds: [],
          metadata: null,
          isRead: false,
          createdAt: '2026-08-29T14:06:42.816Z',
          updatedAt: '2026-08-29T14:06:42.816Z',
        },
      ],
      hasNextPage: true,
    });

    const page = await notificationsApi.list({ page: 2, limit: 20 });

    expect(getJson).toHaveBeenCalledWith(
      'v1/notifications',
      undefined,
      expect.objectContaining({
        searchParams: { page: 2, limit: 20 },
      })
    );
    expect(NEST_NOTIFICATIONS_PATHS.list).toBe('v1/notifications');
    expect(page.data[0]?.id).toBe('1');
    expect(page.data[0]?.read).toBe(false);
    expect(page.hasNextPage).toBe(true);
  });

  it('PATCHes v1/notifications/{id}/read with an empty body', async () => {
    patchMaybeJson.mockResolvedValue({
      id: '1',
      title: 't',
      body: '',
      audience: 'all',
      targetRoles: [],
      userId: null,
      readByUserIds: ['u1'],
      metadata: null,
      isRead: true,
      createdAt: '2026-08-29T14:06:42.816Z',
      updatedAt: '2026-08-29T14:06:42.819Z',
    });

    const updated = await notificationsApi.markAsRead('1');

    expect(patchMaybeJson).toHaveBeenCalledWith(
      'v1/notifications/1/read',
      {},
      undefined
    );
    expect(updated?.read).toBe(true);
  });

  it('returns null when PATCH has no JSON body', async () => {
    patchMaybeJson.mockResolvedValue(null);
    await expect(notificationsApi.markAsRead('1')).resolves.toBeNull();
  });
});

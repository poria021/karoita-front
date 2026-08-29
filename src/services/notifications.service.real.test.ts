import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { notificationsApi } from '@/services/notifications/real/notifications.api';
import { NotificationsService } from '@/services/notifications.service';

vi.mock('@/services/notifications/real/notifications.api', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('@/services/notifications/real/notifications.api')
    >();
  return {
    ...actual,
    notificationsApi: {
      list: vi.fn(),
      markAsRead: vi.fn(),
    },
  };
});

function nestMapped(id: string, read: boolean) {
  return {
    id,
    kind: 'message' as const,
    title: id,
    createdAt: '2026-08-29T14:06:42.816Z',
    read,
  };
}

describe('NotificationsService (real)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'real');
    vi.mocked(notificationsApi.list).mockReset();
    vi.mocked(notificationsApi.markAsRead).mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('listPaginated forwards page/limit to GET', async () => {
    vi.mocked(notificationsApi.list).mockResolvedValue({
      data: [nestMapped('a', false)],
      hasNextPage: true,
    });

    const page = await NotificationsService.listPaginated({ page: 1, limit: 20 });

    expect(notificationsApi.list).toHaveBeenCalledWith({ page: 1, limit: 20 });
    expect(page.hasNextPage).toBe(true);
  });

  it('markAsRead returns the patched row without listing again', async () => {
    vi.mocked(notificationsApi.markAsRead).mockResolvedValue(
      nestMapped('a', true)
    );

    const updated = await NotificationsService.markAsRead('a');

    expect(notificationsApi.markAsRead).toHaveBeenCalledWith('a');
    expect(notificationsApi.list).not.toHaveBeenCalled();
    expect(updated?.read).toBe(true);
  });

  it('markAllAsRead pages GET then PATCHes unread ids', async () => {
    vi.mocked(notificationsApi.list)
      .mockResolvedValueOnce({
        data: [nestMapped('a', false), nestMapped('b', true)],
        hasNextPage: true,
      })
      .mockResolvedValueOnce({
        data: [nestMapped('c', false)],
        hasNextPage: false,
      })
      .mockResolvedValueOnce({
        data: [nestMapped('a', true), nestMapped('b', true)],
        hasNextPage: false,
      });
    vi.mocked(notificationsApi.markAsRead).mockResolvedValue(null);

    const after = await NotificationsService.markAllAsRead();

    expect(notificationsApi.markAsRead).toHaveBeenCalledWith('a');
    expect(notificationsApi.markAsRead).toHaveBeenCalledWith('c');
    expect(notificationsApi.markAsRead).not.toHaveBeenCalledWith('b');
    expect(after.data.every((item) => item.read)).toBe(true);
  });
});

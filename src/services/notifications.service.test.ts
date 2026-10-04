import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetMockNotificationsForTests } from '@/services/notifications/mock/mock-notifications.store';
import { NotificationsService } from '@/services/notifications.service';

describe('NotificationsService (mock)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');
    vi.stubEnv('NODE_ENV', 'development');
    resetMockNotificationsForTests();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('lists seed notifications with English ids', async () => {
    const list = await NotificationsService.list();
    expect(list.map((item) => item.id)).toEqual([
      'ntf-1',
      'ntf-2',
      'ntf-3',
      'ntf-4',
    ]);
    expect(list.find((item) => item.id === 'ntf-1')?.kind).toBe('message');
    expect(list.find((item) => item.id === 'ntf-1')?.body).toBeTruthy();
    expect(list.find((item) => item.id === 'ntf-2')?.kind).toBe('system');
    expect(list.find((item) => item.id === 'ntf-1')?.read).toBe(false);
    expect(list.find((item) => item.id === 'ntf-3')?.read).toBe(true);
  });

  it('listPaginated returns hasNextPage=false in mock mode', async () => {
    const result = await NotificationsService.listPaginated();
    expect(result.hasNextPage).toBe(false);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('markAsRead flips only the target notification', async () => {
    const updated = await NotificationsService.markAsRead('ntf-2');
    expect(updated?.read).toBe(true);
    const list = await NotificationsService.list();
    expect(list.find((item) => item.id === 'ntf-2')?.read).toBe(true);
    expect(list.find((item) => item.id === 'ntf-1')?.read).toBe(false);
  });

  it('markAllAsRead marks every item', async () => {
    const after = await NotificationsService.markAllAsRead();
    expect(after.data.every((item) => item.read)).toBe(true);
    expect(after.hasNextPage).toBe(false);
  });
});

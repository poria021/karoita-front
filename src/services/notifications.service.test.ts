import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resetMockNotificationsForTests } from '@/services/notifications/mock-notifications.store';
import { NotificationsService } from '@/services/notifications.service';

describe('NotificationsService (mock)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');
    vi.stubEnv('NODE_ENV', 'development');
    resetMockNotificationsForTests();
  });

  it('lists seed notifications with English ids', async () => {
    const list = await NotificationsService.list();
    expect(list.map((item) => item.id)).toEqual(['ntf-1', 'ntf-2', 'ntf-3']);
    expect(list.find((item) => item.id === 'ntf-1')?.read).toBe(false);
    expect(list.find((item) => item.id === 'ntf-3')?.read).toBe(true);
  });

  it('markAsRead flips only the target notification', async () => {
    const after = await NotificationsService.markAsRead('ntf-2');
    expect(after.find((item) => item.id === 'ntf-2')?.read).toBe(true);
    expect(after.find((item) => item.id === 'ntf-1')?.read).toBe(false);
  });

  it('markAllAsRead marks every item', async () => {
    const after = await NotificationsService.markAllAsRead();
    expect(after.every((item) => item.read)).toBe(true);
  });
});

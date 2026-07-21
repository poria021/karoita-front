import { create } from 'zustand';

import { NotificationsService } from '@/services/notifications.service';
import type { AppNotification } from '@/types/notifications';

interface NotificationsState {
  notifications: AppNotification[];
}

interface NotificationsActions {
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

type NotificationsStore = NotificationsState & NotificationsActions;

function clientSnapshot(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  return NotificationsService.getSnapshot();
}

/**
 * Cache نازک اعلان‌ها برای chrome هدر — منبع حقیقت Facade است، نه seed داخل store.
 */
export const useNotificationsStore = create<NotificationsStore>()((set) => ({
  notifications: clientSnapshot(),
  refresh: async () => {
    const notifications = await NotificationsService.list();
    set({ notifications });
  },
  markAsRead: async (notificationId) => {
    const notifications =
      await NotificationsService.markAsRead(notificationId);
    set({ notifications });
  },
  markAllAsRead: async () => {
    const notifications = await NotificationsService.markAllAsRead();
    set({ notifications });
  },
}));

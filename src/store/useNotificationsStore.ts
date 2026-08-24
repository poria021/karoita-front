import { create } from 'zustand';

import { NotificationsService } from '@/services/notifications.service';
import type { AppNotification } from '@/types/notifications';

interface NotificationsState {
  notifications: AppNotification[];
  hasNextPage: boolean;
  currentPage: number;
}

interface NotificationsActions {
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

type NotificationsStore = NotificationsState & NotificationsActions;

function clientSnapshot(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  return NotificationsService.getSnapshot();
}

const PAGE_SIZE = 20;

/**
 * Cache نازک اعلان‌ها برای chrome هدر — منبع حقیقت Facade است، نه seed داخل store.
 */
export const useNotificationsStore = create<NotificationsStore>()((set, get) => ({
  notifications: clientSnapshot(),
  hasNextPage: false,
  currentPage: 1,

  refresh: async () => {
    const result = await NotificationsService.listPaginated({
      page: 1,
      limit: PAGE_SIZE,
    });
    set({
      notifications: result.data,
      hasNextPage: result.hasNextPage,
      currentPage: 1,
    });
  },

  loadMore: async () => {
    const { currentPage, hasNextPage, notifications } = get();
    if (!hasNextPage) return;
    const nextPage = currentPage + 1;
    const result = await NotificationsService.listPaginated({
      page: nextPage,
      limit: PAGE_SIZE,
    });
    set({
      notifications: [...notifications, ...result.data],
      hasNextPage: result.hasNextPage,
      currentPage: nextPage,
    });
  },

  markAsRead: async (notificationId) => {
    const notifications = await NotificationsService.markAsRead(notificationId);
    set({ notifications });
  },

  markAllAsRead: async () => {
    const notifications = await NotificationsService.markAllAsRead();
    set({ notifications });
  },
}));

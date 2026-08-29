import { create } from 'zustand';

import { NOTIFICATIONS_PAGE_SIZE } from '@/services/notifications/real/notifications.api';
import { NotificationsService } from '@/services/notifications.service';
import type { AppNotification } from '@/types/notifications';

interface NotificationsState {
  notifications: AppNotification[];
  hasNextPage: boolean;
  currentPage: number;
  status: 'idle' | 'loading' | 'ready' | 'error';
  isLoadingMore: boolean;
  isMutating: boolean;
  errorMessage: string | null;
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

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return 'دریافت اعلان‌ها ناموفق بود. دوباره تلاش کنید.';
}

/**
 * Cache نازک اعلان‌ها برای chrome هدر — منبع حقیقت Facade است.
 * PATCH تکی لیست صفحه‌بندی‌شده را با GET صفحهٔ ۱ عوض نمی‌کند.
 */
export const useNotificationsStore = create<NotificationsStore>()((set, get) => ({
  notifications: clientSnapshot(),
  hasNextPage: false,
  currentPage: 1,
  status: 'idle',
  isLoadingMore: false,
  isMutating: false,
  errorMessage: null,

  refresh: async () => {
    const hadItems = get().notifications.length > 0;
    set({
      status: hadItems ? get().status : 'loading',
      errorMessage: null,
    });
    try {
      const result = await NotificationsService.listPaginated({
        page: 1,
        limit: NOTIFICATIONS_PAGE_SIZE,
      });
      set({
        notifications: result.data,
        hasNextPage: result.hasNextPage,
        currentPage: 1,
        status: 'ready',
        errorMessage: null,
      });
    } catch (error) {
      set({
        status: hadItems ? 'ready' : 'error',
        errorMessage: toErrorMessage(error),
      });
    }
  },

  loadMore: async () => {
    const { currentPage, hasNextPage, notifications, isLoadingMore } = get();
    if (!hasNextPage || isLoadingMore) return;
    set({ isLoadingMore: true, errorMessage: null });
    try {
      const nextPage = currentPage + 1;
      const result = await NotificationsService.listPaginated({
        page: nextPage,
        limit: NOTIFICATIONS_PAGE_SIZE,
      });
      const seen = new Set(notifications.map((item) => item.id));
      const appended = result.data.filter((item) => !seen.has(item.id));
      set({
        notifications: [...notifications, ...appended],
        hasNextPage: appended.length === 0 ? false : result.hasNextPage,
        currentPage: nextPage,
        isLoadingMore: false,
      });
    } catch (error) {
      set({
        isLoadingMore: false,
        errorMessage: toErrorMessage(error),
      });
    }
  },

  markAsRead: async (notificationId) => {
    const previous = get().notifications;
    const target = previous.find((item) => item.id === notificationId);
    if (!target || target.read) return;

    set({
      notifications: previous.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item
      ),
      isMutating: true,
    });

    try {
      const updated = await NotificationsService.markAsRead(notificationId);
      if (updated) {
        set((state) => ({
          notifications: state.notifications.map((item) =>
            item.id === notificationId ? { ...item, ...updated, read: true } : item
          ),
          isMutating: false,
        }));
        return;
      }
      set({ isMutating: false });
    } catch (error) {
      set({
        notifications: previous,
        isMutating: false,
        errorMessage: toErrorMessage(error),
      });
    }
  },

  markAllAsRead: async () => {
    const previous = get().notifications;
    if (!previous.some((item) => !item.read) && !get().hasNextPage) return;

    set({
      notifications: previous.map((item) => ({ ...item, read: true })),
      isMutating: true,
      errorMessage: null,
    });

    try {
      const result = await NotificationsService.markAllAsRead();
      set({
        notifications: result.data,
        hasNextPage: result.hasNextPage,
        currentPage: 1,
        isMutating: false,
      });
    } catch (error) {
      set({
        notifications: previous,
        isMutating: false,
        errorMessage: toErrorMessage(error),
      });
    }
  },
}));

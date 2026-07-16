import { create } from 'zustand';

/** Mirrors the shape of `notifications` items inside `original-karvita.html`. */
export interface AppNotification {
  id: string;
  title: string;
  /** Farsi-friendly relative label (e.g. "۵ دقیقه پیش"), pre-formatted by the source. */
  time: string;
  read: boolean;
}

interface NotificationsState {
  notifications: AppNotification[];
}

interface NotificationsActions {
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

type NotificationsStore = NotificationsState & NotificationsActions;

/** Mock seed until the real `NotificationService` (NestJS) endpoint exists. */
const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 'ntf-1', title: 'گزارش روزانه شما توسط ناظر تایید شد.', time: '۵ دقیقه پیش', read: false },
  { id: 'ntf-2', title: 'مهلت انتخاب واحد کارورزی نیم‌سال جاری تمدید شد.', time: '۲ ساعت پیش', read: false },
  { id: 'ntf-3', title: 'مدارک هویتی شما با موفقیت تایید شد.', time: 'دیروز', read: true },
];

/**
 * Lightweight, client-only notifications store consumed by `Header.tsx`'s
 * bell dropdown (rule 60, #5: shared UI/domain-crossing state lives in
 * `src/store/`). The shape already matches the future NestJS DTO, so only
 * the seed above needs to change once a real `NotificationService` exists.
 */
export const useNotificationsStore = create<NotificationsStore>()((set) => ({
  notifications: MOCK_NOTIFICATIONS,
  markAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
    })),
}));

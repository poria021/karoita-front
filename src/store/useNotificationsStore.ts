import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
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

const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 'ntf-1', title: 'گزارش روزانه شما توسط ناظر تایید شد.', time: '۵ دقیقه پیش', read: false },
  { id: 'ntf-2', title: 'مهلت انتخاب واحد کارورزی نیم‌سال جاری تمدید شد.', time: '۲ ساعت پیش', read: false },
  { id: 'ntf-3', title: 'مدارک هویتی شما با موفقیت تایید شد.', time: 'دیروز', read: true },
];

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

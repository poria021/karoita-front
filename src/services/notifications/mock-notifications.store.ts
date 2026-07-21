import type { AppNotification } from '@/types/notifications';

const SEED: readonly AppNotification[] = [
  {
    id: 'ntf-1',
    title: 'گزارش روزانه شما توسط ناظر تایید شد.',
    time: '۵ دقیقه پیش',
    read: false,
  },
  {
    id: 'ntf-2',
    title: 'مهلت انتخاب واحد کارورزی نیم‌سال جاری تمدید شد.',
    time: '۲ ساعت پیش',
    read: false,
  },
  {
    id: 'ntf-3',
    title: 'مدارک هویتی شما با موفقیت تایید شد.',
    time: 'دیروز',
    read: true,
  },
];

let notifications: AppNotification[] = SEED.map((item) => ({ ...item }));

function cloneList(): AppNotification[] {
  return notifications.map((item) => ({ ...item }));
}

export function readMockNotifications(): AppNotification[] {
  return cloneList();
}

export function markMockNotificationAsRead(
  notificationId: string
): AppNotification[] {
  notifications = notifications.map((item) =>
    item.id === notificationId ? { ...item, read: true } : item
  );
  return cloneList();
}

export function markAllMockNotificationsAsRead(): AppNotification[] {
  notifications = notifications.map((item) => ({ ...item, read: true }));
  return cloneList();
}

/** Test-only reset to seed. */
export function resetMockNotificationsForTests(): void {
  notifications = SEED.map((item) => ({ ...item }));
}

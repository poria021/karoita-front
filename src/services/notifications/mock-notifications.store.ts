import type { AppNotification } from '@/types/notifications';

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

const SEED: readonly AppNotification[] = [
  {
    id: 'ntf-1',
    kind: 'message',
    title: 'یادآوری گزارش هفتگی کارورزی',
    senderLabel: 'استاد راهنما',
    body: 'دانشجوی گرامی، لطفاً گزارش هفتگی کارورزی را تا پایان روز چهارشنبه در سامانه ثبت کنید. در صورت تأخیر، نمره بخش گزارش لحاظ نخواهد شد.',
    createdAt: hoursAgo(0.08),
    read: false,
  },
  {
    id: 'ntf-2',
    kind: 'system',
    title: 'مهلت انتخاب واحد کارورزی نیم‌سال جاری تمدید شد.',
    createdAt: hoursAgo(2),
    read: false,
  },
  {
    id: 'ntf-3',
    kind: 'system',
    title: 'مدارک هویتی شما با موفقیت تایید شد.',
    createdAt: daysAgo(1),
    read: true,
  },
  {
    id: 'ntf-4',
    kind: 'message',
    title: 'نظر روی گزارش روزانه',
    senderLabel: 'معلم راهنما',
    body: 'گزارش دیروز شما بررسی شد. توضیحات فعالیت در مدرسه کافی است؛ لطفاً برای جلسه بعد، بازخورد دانش‌آموزان را هم اضافه کنید.',
    createdAt: daysAgo(10),
    read: false,
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

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

/** داده‌ی ثابت حالت mock — هیچ state یا ذخیره‌سازی‌ای ندارد. */
export function mockNotifications(): AppNotification[] {
  return SEED.map((item) => ({ ...item }));
}

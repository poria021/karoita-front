export type AppNotificationKind = 'message' | 'system';

export type AppNotification = {
  id: string;
  /** message = از کاربر/نقش دیگر (قابل باز شدن)؛ system = رویداد سرور (ثابت). */
  kind: AppNotificationKind;
  title: string;
  /** متن کامل برای kind=message؛ برای system اختیاری است. */
  body?: string;
  /** برچسب فرستنده برای پیام‌ها (مثلاً استاد راهنما). */
  senderLabel?: string;
  /** ISO timestamp — نمایش با formatJalaliDate. */
  createdAt: string;
  read: boolean;
};

export function isExpandableNotification(
  notification: AppNotification
): boolean {
  void notification;
  return false;
}

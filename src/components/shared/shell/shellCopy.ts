/**
 * Phrases shared across product shell chrome (header / sidebar overlays).
 * Keep short, institutional Persian — not a full i18n layer.
 */
export const shellCopy = {
  a11y: {
    skipToMain: 'پرش به محتوای اصلی',
  },
  notifications: {
    title: 'اعلان‌های سیستم',
    empty: 'اعلانی وجود ندارد',
    markAllRead: 'همه را خواندم',
    menuLabel: 'اعلان‌ها',
  },
  nav: {
    /** Collapsed-rail title suffix when modules are locked. */
    lockedSuffix: 'غیرفعال',
    /** Aria reason — matches onboarding gate language. */
    lockedUntilDocs: 'غیرفعال تا تأیید مدارک',
  },
  account: {
    profile: 'پروفایل',
    installApp: 'نصب نسخه اپ',
    installAppPwa: 'نصب و اجرای مستقیم (PWA)',
    installOfferTitle: 'نصب کارویتا روی دستگاه',
    installOfferBody:
      'سامانه را مثل یک برنامه روی میز کار یا صفحهٔ اصلی داشته باشید؛ دسترسی سریع‌تر و کار آفلاین روی شل برنامه.',
    installOfferNativeHint: 'با تأیید، پنجرهٔ نصب مرورگر باز می‌شود.',
    installOfferChromeHint:
      'اگر پنجرهٔ نصب باز نشد: منوی سه‌نقطهٔ Chrome → Install app / نصب کارویتا.',
    installOfferIosHint:
      'در Safari دکمهٔ اشتراک را بزنید و Add to Home Screen را انتخاب کنید.',
    installOfferIosTitle: 'نصب روی آیفون / آیپد (Safari)',
    installOfferIosHintSteps: [
      'در نوار پایین Safari روی آیکون اشتراک‌گذاری (مربع با فلش رو به بالا) بزنید.',
      'از فهرست باز شده «Add to Home Screen» را انتخاب کنید.',
      'روی «Add» بزنید — آیکون کارویتا به صفحهٔ اصلی گوشی اضافه می‌شود.',
    ],
    installOfferMacTitle: 'نصب روی مک (Safari)',
    installOfferMacHintSteps: [
      'از منوی File در بالای Safari روی «Add to Dock…» بزنید.',
      'یا روی آیکون اشتراک‌گذاری کنار نوار آدرس Safari بزنید و «Add to Dock» را انتخاب کنید.',
      'کارویتا به‌صورت یک برنامهٔ مستقل به Dock اضافه می‌شود.',
    ],
    installOfferMacUnsupportedHint:
      'این قابلیت در Safari 17 (macOS Sonoma) به بعد در دسترس است؛ در نسخه‌های قدیمی‌تر می‌توانید از Chrome استفاده کنید.',
    installOfferLater: 'بعداً',
    installOfferAction: 'نصب برنامه',
    installOfferGotIt: 'متوجه شدم',
    pwaUpdated: 'نسخهٔ جدید کارویتا آماده است.',
    pwaReload: 'بارگذاری مجدد',
    logout: 'خروج',
    logoutConfirmTitle: 'خروج از حساب کاربری',
    logoutConfirmDescription:
      'آیا مایلید به طور کامل از حساب کاربری خود در سامانه کارویتا خارج شوید؟',
    logoutConfirmAction: 'خروج از حساب',
    logoutCancel: 'انصراف',
    logoutError: 'خروج با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
  },
} as const;

export function notificationsMenuAriaLabel(unreadCount: number, unreadPersian: string): string {
  if (unreadCount <= 0) return shellCopy.notifications.menuLabel;
  return `${shellCopy.notifications.menuLabel}، ${unreadPersian} خوانده‌نشده`;
}

export function lockedNavTitle(itemTitle: string): string {
  return `${itemTitle} (${shellCopy.nav.lockedSuffix})`;
}

export function lockedNavAriaLabel(itemTitle: string): string {
  return `${itemTitle} — ${shellCopy.nav.lockedUntilDocs}`;
}

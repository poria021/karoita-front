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

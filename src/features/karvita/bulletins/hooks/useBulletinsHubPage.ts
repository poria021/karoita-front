'use client';

import { useEffect, useMemo } from 'react';

import { useSyncedUrlParam } from '@/hooks/useSyncedUrlParam';
import {
  announcementsHubTabsFor,
  defaultAnnouncementsHubTab,
  type AnnouncementsHubTab,
} from '@/services/bulletins/bulletin-rules';
import { useUserStore } from '@/store/useUserStore';

const HUB_TAB_LABEL: Record<AnnouncementsHubTab, string> = {
  announcement: 'اطلاعیه‌های منتشرشده',
  advertisement: 'تبلیغات',
  received: 'اطلاعیه‌های دریافتی',
  notifications: 'اعلان‌های سیستم',
};

/**
 * برای نقش‌هایی که تب `notifications` ندارند، `?tab=notifications` قدیمی
 * را مثل دریافتی بخوان تا به تب پیش‌فرض (انتشار) نیفتد.
 */
function hubUrlAllowedTabs(
  allowedTabs: readonly AnnouncementsHubTab[],
  defaultTab: AnnouncementsHubTab
): AnnouncementsHubTab[] {
  const base =
    allowedTabs.length > 0
      ? [...allowedTabs]
      : ([defaultTab] as AnnouncementsHubTab[]);
  if (base.includes('received') && !base.includes('notifications')) {
    base.push('notifications');
  }
  return base;
}

/**
 * تب نقش‌آگاه هاب اطلاعیه‌ها — آینه در `?tab=` بدون ناوبری کامل Next.
 */
export function useBulletinsHubPage() {
  const role = useUserStore((state) => state.activeUser?.role);
  const allowedTabs = useMemo(
    () => announcementsHubTabsFor(role),
    [role]
  );
  const defaultTab = useMemo(
    () => defaultAnnouncementsHubTab(role),
    [role]
  );
  const urlAllowedTabs = useMemo(
    () => hubUrlAllowedTabs(allowedTabs, defaultTab),
    [allowedTabs, defaultTab]
  );
  const hasNotificationsTab = allowedTabs.includes('notifications');

  const [tab, setTab] = useSyncedUrlParam<AnnouncementsHubTab>({
    name: 'tab',
    allowed: urlAllowedTabs,
    defaultValue: defaultTab,
  });

  // لینک قدیمی `notifications` برای نقش‌های بدون این تب → `received`.
  useEffect(() => {
    if (tab !== 'notifications') return;
    if (hasNotificationsTab) return;
    if (!allowedTabs.includes('received')) return;
    setTab('received');
  }, [allowedTabs, hasNotificationsTab, setTab, tab]);

  const activeTab: AnnouncementsHubTab =
    tab === 'notifications' && !hasNotificationsTab ? 'received' : tab;

  const tabItems = useMemo(
    () =>
      allowedTabs.map((key) => ({
        key,
        label: HUB_TAB_LABEL[key],
      })),
    [allowedTabs]
  );

  return {
    role,
    tab: activeTab,
    setTab,
    tabItems,
    allowedTabs,
    showTabs: tabItems.length > 1,
  };
}

export type UseBulletinsHubPageReturn = ReturnType<typeof useBulletinsHubPage>;

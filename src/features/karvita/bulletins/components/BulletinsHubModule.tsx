'use client';

import { useLayoutEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import type { AppTabsGridCols } from '@/components/shared/AppTabs';
import { DashboardAccessPlaceholder } from '@/components/shared/shell/DashboardAccessPlaceholder';
import {
  canAccessAnnouncementsHub,
  showsAnnouncementsHubNotifications,
} from '@/services/bulletins/bulletin-rules';
import { getPostLoginPath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';

import { useBulletinsHubPage } from '../hooks/useBulletinsHubPage';
import { BulletinsComposePanel } from './BulletinsComposePanel';
import { BulletinsNotificationsPanel } from './BulletinsNotificationsPanel';
import { BulletinsReceivedPanel } from './BulletinsReceivedPanel';

/** ناشر یا گیرندۀ اطلاعیه؛ وگرنه به میز کار خودش. */
function BulletinsHubGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);
  const shouldRedirect = Boolean(
    activeUser && !canAccessAnnouncementsHub(activeUser.role)
  );

  useLayoutEffect(() => {
    if (!shouldRedirect || !activeUser) return;
    router.replace(getPostLoginPath(activeUser));
  }, [activeUser, router, shouldRedirect]);

  if (!activeUser || shouldRedirect) return <DashboardAccessPlaceholder />;
  return <>{children}</>;
}

function hubGridCols(count: number): AppTabsGridCols {
  if (count >= 4) return 4;
  if (count === 3) return 3;
  return 2;
}

function BulletinsInboxPanels({ showNotifications }: { showNotifications: boolean }) {
  return (
    <div
      dir="rtl"
      className={
        showNotifications
          ? 'grid grid-cols-1 gap-kv-stack lg:grid-cols-2 lg:items-stretch'
          : 'flex flex-col gap-kv-stack'
      }
    >
      {/* در RTL ستون اول = سمت راست: اطلاعیه‌های دریافتی */}
      <BulletinsReceivedPanel />
      {showNotifications ? <BulletinsNotificationsPanel /> : null}
    </div>
  );
}

function BulletinsHubContent() {
  const page = useBulletinsHubPage();
  const showNotificationsBeside = showsAnnouncementsHubNotifications(page.role);

  return (
    <div className="flex flex-col gap-kv-stack">
      {page.showTabs ? (
        <div className="mb-kv-pair">
          <AppTabs
            value={page.tab}
            onValueChange={(value) =>
              page.setTab(value as typeof page.tab)
            }
            gridCols={hubGridCols(page.tabItems.length)}
          >
            <AppTabsList aria-label="بخش‌های اطلاعیه‌ها و اعلانات">
              {page.tabItems.map((item) => (
                <AppTabsTrigger key={item.key} value={item.key}>
                  {item.label}
                </AppTabsTrigger>
              ))}
            </AppTabsList>
          </AppTabs>
        </div>
      ) : null}

      {page.tab === 'announcement' || page.tab === 'advertisement' ? (
        <BulletinsComposePanel kind={page.tab} />
      ) : null}
      {page.tab === 'received' ? (
        <BulletinsInboxPanels showNotifications={showNotificationsBeside} />
      ) : null}
      {page.tab === 'notifications' ? (
        <BulletinsNotificationsPanel defaultOpen />
      ) : null}
    </div>
  );
}

/** هاب نقش‌آگاه: انتشار / دریافتی‌ها / اعلان‌ها (دانشجو و مهارت‌آموز). */
export function BulletinsHubModule() {
  return (
    <BulletinsHubGuard>
      <BulletinsHubContent />
    </BulletinsHubGuard>
  );
}

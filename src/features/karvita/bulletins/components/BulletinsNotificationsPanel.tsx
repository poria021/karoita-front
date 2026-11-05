'use client';

import { useEffect, useRef } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { Spinner } from '@/components/ui/spinner';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import { useUserStore } from '@/store/useUserStore';
import { isExpandableNotification } from '@/types/notifications';
import { formatNotificationTime } from '@/utils/formatJalaliDate';
import { faIcons } from '@/utils/iconMap';

import { isNearScrollEnd } from '../hooks/useProgressiveListWindow';
import { HubInboxBox } from './HubInboxBox';

type BulletinsNotificationsPanelProps = {
  /** وقتی تب جداست پیش‌فرض باز؛ کنار دریافتی روی موبایل معمولاً بسته. */
  defaultOpen?: boolean;
};

/**
 * باکس اعلان‌های سیستم — بولت برای خوانده‌نشده + دکمهٔ «خواندم».
 */
export function BulletinsNotificationsPanel({
  defaultOpen = false,
}: BulletinsNotificationsPanelProps) {
  const userId = useUserStore((state) => state.activeUser?.id);
  const notifications = useNotificationsStore((state) => state.notifications);
  const hasNextPage = useNotificationsStore((state) => state.hasNextPage);
  const status = useNotificationsStore((state) => state.status);
  const isLoadingMore = useNotificationsStore((state) => state.isLoadingMore);
  const errorMessage = useNotificationsStore((state) => state.errorMessage);
  const refresh = useNotificationsStore((state) => state.refresh);
  const loadMore = useNotificationsStore((state) => state.loadMore);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;
    void refresh();
  }, [userId, refresh]);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const isInitialLoading =
    Boolean(userId) &&
    notifications.length === 0 &&
    (status === 'idle' || status === 'loading');

  function onListScroll() {
    const el = listRef.current;
    if (!el || !hasNextPage || isLoadingMore) return;
    if (isNearScrollEnd(el)) void loadMore();
  }

  return (
    <HubInboxBox
      titleId="bulletins-notifications-title"
      title="اعلان‌های سیستم"
      count={notifications.length}
      defaultOpen={defaultOpen}
      icon={<FaIcon icon={faIcons.circleInfo} size="sm" />}
      headerAction={
        unreadCount > 0 ? (
          <KvButton
            type="button"
            color="cta"
            appearance="text"
            size="xs"
            onClick={() => {
              void markAllAsRead();
            }}
          >
            خواندن همه
          </KvButton>
        ) : null
      }
    >
      {errorMessage ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-kv-pair">
          <KvAlert
            variant="error"
            title="بارگذاری ناموفق بود"
            description={errorMessage}
            actions={
              <KvButton
                type="button"
                appearance="secondary"
                size="sm"
                onClick={() => void refresh()}
              >
                تلاش مجدد
              </KvButton>
            }
          />
        </div>
      ) : (
        <div
          ref={listRef}
          onScroll={onListScroll}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
        >
          {isInitialLoading ? (
            <div
              className="flex min-h-0 flex-1 flex-col items-center justify-center gap-kv-pair"
              role="status"
              aria-label="در حال دریافت اعلان‌ها"
            >
              <Spinner className="size-5 text-kv-brand" aria-hidden="true" />
              <KvTypography variant="caption" tone="muted" as="p">
                در حال دریافت اعلان‌ها
              </KvTypography>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <KvTypography
                variant="body"
                tone="muted"
                as="p"
                className="text-center"
              >
                اعلانی وجود ندارد.
              </KvTypography>
            </div>
          ) : (
            <ul className="flex list-none flex-col divide-y divide-kv-border-muted">
              {notifications.map((notification) => {
                const isUnread = !notification.read;
                const showBody = isExpandableNotification(notification);

                return (
                  <li key={notification.id} className="py-kv-group">
                    <div className="flex w-full items-start gap-kv-inline">
                      {isUnread ? (
                        <span
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-kv-brand"
                          aria-label="خوانده‌نشده"
                        />
                      ) : (
                        <span
                          className="mt-1.5 size-1.5 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <div className="min-w-0 flex-1 break-words pe-kv-pair">
                        <KvTypography
                          variant="caption"
                          weight="bold"
                          as="span"
                          className={
                            isUnread
                              ? 'block text-kv-text'
                              : 'block text-kv-text-secondary'
                          }
                        >
                          {notification.title}
                        </KvTypography>
                        {showBody ? (
                          <KvTypography
                            variant="caption"
                            tone="muted"
                            as="span"
                            className="mt-kv-micro block leading-relaxed"
                          >
                            {notification.body}
                          </KvTypography>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-kv-micro">
                        {notification.createdAt ? (
                          <span
                            className="origin-top-end scale-[0.85] whitespace-nowrap opacity-70"
                            dir="rtl"
                          >
                            <KvTypography
                              variant="overline"
                              tone="disabled"
                              as="span"
                            >
                              {formatNotificationTime(notification.createdAt)}
                            </KvTypography>
                          </span>
                        ) : null}
                        {isUnread ? (
                          <KvButton
                            type="button"
                            color="cta"
                            appearance="text"
                            size="xs"
                            onClick={() => {
                              void markAsRead(notification.id);
                            }}
                          >
                            خواندم
                          </KvButton>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {isLoadingMore ? (
            <div
              className="flex justify-center py-2"
              role="status"
              aria-label="بارگذاری موارد بیشتر"
            >
              <Spinner className="size-4 text-kv-brand" aria-hidden="true" />
            </div>
          ) : null}
        </div>
      )}
    </HubInboxBox>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvDropdownMenu,
  KvDropdownMenuContent,
  KvDropdownMenuTrigger,
} from '@/components/shared/KvDropdownMenu';
import {
  kvOverlayDropdownAutoGutterClassName,
  kvOverlayItemDividerClassName,
  kvOverlayListGutterSymmetricClassName,
  kvOverlayListScrollClassName,
} from '@/components/shared/kvOverlayMenu';
import { KvTypography } from '@/components/shared/KvTypography';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import { useUserStore } from '@/store/useUserStore';
import { isExpandableNotification } from '@/types/notifications';
import { formatNotificationTime } from '@/utils/formatJalaliDate';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

/** حداقل فاصله بین دو refresh متوالی هنگام باز شدن منو (ms) */
const NOTIFICATIONS_OPEN_COOLDOWN_MS = 30_000;

/**
 * منوی اعلان‌های هدر — GET صفحهٔ اول روی ورود نشست، PATCH روی کلیک.
 */
export function HeaderNotificationsMenu() {
  const userId = useUserStore((state) => state.activeUser?.id);
  const notifications = useNotificationsStore((state) => state.notifications);
  const hasNextPage = useNotificationsStore((state) => state.hasNextPage);
  const status = useNotificationsStore((state) => state.status);
  const isLoadingMore = useNotificationsStore((state) => state.isLoadingMore);
  const errorMessage = useNotificationsStore((state) => state.errorMessage);
  const refresh = useNotificationsStore((state) => state.refresh);
  const loadMore = useNotificationsStore((state) => state.loadMore);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const [isOpen, setIsOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const lastFetchedAtRef = useRef<number>(0);

  useEffect(() => {
    if (!userId) return;
    void refresh();
    lastFetchedAtRef.current = Date.now();
  }, [userId, refresh]);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const isInitialLoading =
    Boolean(userId) &&
    notifications.length === 0 &&
    (status === 'idle' || status === 'loading');

  function onListScroll() {
    const el = listRef.current;
    if (!el || !hasNextPage || isLoadingMore) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining < 48) void loadMore();
  }

  return (
    <KvDropdownMenu
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open && userId) {
          const elapsed = Date.now() - lastFetchedAtRef.current;
          if (elapsed >= NOTIFICATIONS_OPEN_COOLDOWN_MS) {
            void refresh();
            lastFetchedAtRef.current = Date.now();
          }
        }
      }}
    >
      <KvDropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={
            unreadCount > 0
              ? `اعلان‌ها، ${toPersianDigits(unreadCount)} خوانده‌نشده`
              : 'اعلان‌ها'
          }
          className="relative flex size-11 items-center justify-center rounded-kv-control text-kv-text-subtle transition-colors hover:bg-kv-surface-subtle/60 hover:text-kv-text-secondary focus-visible:ring-[3px] focus-visible:ring-kv-ring/20"
        >
          <span className="relative inline-flex">
            <FaIcon
              icon={faIcons.bell}
              size="md"
              className={cn(
                'transition-transform duration-200 ease-out',
                isOpen && 'rotate-12'
              )}
            />
            {unreadCount > 0 ? (
              <span
                className="absolute top-0 start-0 size-1.5 rounded-full bg-kv-danger ring-1 ring-kv-surface"
                aria-hidden="true"
              />
            ) : null}
          </span>
        </button>
      </KvDropdownMenuTrigger>

      <KvDropdownMenuContent
        align="end"
        className={cn('w-80', kvOverlayDropdownAutoGutterClassName)}
      >
        <div className="border-b border-kv-border/70 px-3.5 py-2.5">
          <span className="origin-start scale-90">
            <KvTypography variant="overline" tone="muted" as="span">
              اعلان‌های سیستم
            </KvTypography>
          </span>
        </div>

        {errorMessage ? (
          <div className="flex items-start justify-between gap-kv-pair border-b border-kv-border/70 px-3.5 py-2">
            <KvTypography variant="caption" tone="danger" as="p">
              {errorMessage}
            </KvTypography>
            <KvButton
              type="button"
              color="neutral"
              appearance="text"
              size="sm"
              onClick={() => {
                void refresh();
              }}
            >
              تلاش دوباره
            </KvButton>
          </div>
        ) : null}

        <div
          ref={listRef}
          onScroll={onListScroll}
          className={cn(
            kvOverlayListScrollClassName,
            kvOverlayListGutterSymmetricClassName,
            'max-h-[min(16rem,45dvh)] overscroll-contain'
          )}
        >
          {isInitialLoading ? (
            <div
              className="flex flex-col items-center justify-center gap-kv-pair px-3.5 py-kv-section"
              role="status"
              aria-label="در حال دریافت اعلان‌ها"
            >
              <Spinner className="size-5 text-kv-brand" aria-hidden="true" />
              <KvTypography variant="caption" tone="muted" as="p">
                در حال دریافت اعلان‌ها
              </KvTypography>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-3.5 py-kv-section text-center">
              <KvTypography variant="caption" tone="muted" as="p">
                اعلانی وجود ندارد
              </KvTypography>
            </div>
          ) : (
            notifications.map((notification) => {
              const isUnread = !notification.read;
              const showBody = isExpandableNotification(notification);

              return (
                <div
                  key={notification.id}
                  className={cn(
                    kvOverlayItemDividerClassName,
                    'outline-none',
                    isUnread && 'bg-kv-brand-soft/15'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (isUnread) {
                        void markAsRead(notification.id);
                      }
                    }}
                    className={cn(
                      'flex w-full flex-col gap-kv-micro px-3.5 py-2.5 text-start',
                      'transition-colors hover:bg-kv-surface-muted focus-visible:bg-kv-surface-muted',
                      'focus-visible:outline-none'
                    )}
                  >
                    <span className="flex w-full items-start gap-kv-inline">
                      {isUnread ? (
                        <span
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-kv-danger"
                          aria-hidden="true"
                        />
                      ) : (
                        <span
                          className="mt-1.5 size-1.5 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span className="min-w-0 flex-1 break-words pe-kv-pair">
                        <span className="block w-full">
                          <KvTypography
                            variant="caption"
                            tone="muted"
                            weight="bold"
                            as="span"
                          >
                            {notification.title}
                          </KvTypography>
                        </span>
                        {showBody ? (
                          <span className="mt-kv-micro block">
                            <KvTypography variant="caption" tone="muted" as="span">
                              {notification.body}
                            </KvTypography>
                          </span>
                        ) : null}
                      </span>
                      {notification.createdAt ? (
                        <span
                          className="origin-top-end shrink-0 scale-[0.85] whitespace-nowrap opacity-70"
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
                    </span>
                  </button>
                </div>
              );
            })
          )}
          {isLoadingMore ? (
            <div className="flex justify-center py-2" role="status" aria-label="بارگذاری موارد بیشتر">
              <Spinner className="size-4 text-kv-brand" aria-hidden="true" />
            </div>
          ) : null}
        </div>
      </KvDropdownMenuContent>
    </KvDropdownMenu>
  );
}

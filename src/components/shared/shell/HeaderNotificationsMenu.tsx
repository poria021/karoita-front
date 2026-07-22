'use client';

import { useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvDropdownMenu,
  KvDropdownMenuContent,
  KvDropdownMenuTrigger,
} from '@/components/shared/KvDropdownMenu';
import {
  kvOverlayItemDividerClassName,
  kvOverlaySectionDividerClassName,
} from '@/components/shared/kvOverlayMenu';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import { isExpandableNotification } from '@/types/notifications';
import { formatNotificationTime } from '@/utils/formatJalaliDate';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

/**
 * منوی اعلان‌های هدر — پیام‌های کاربری قابل باز شدن؛ اعلان‌های سیستمی فقط متن ثابت.
 */
export function HeaderNotificationsMenu() {
  const notifications = useNotificationsStore((state) => state.notifications);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <KvDropdownMenu
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setExpandedId(null);
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

      <KvDropdownMenuContent align="end" className="w-80">
        <div
          className={cn(
            'flex items-center justify-between gap-kv-pair px-3.5 py-2.5',
            kvOverlaySectionDividerClassName
          )}
        >
          <span className="origin-start scale-90">
            <KvTypography variant="overline" tone="muted" as="span">
              اعلان‌های سیستم
            </KvTypography>
          </span>
          {unreadCount > 0 ? (
            <KvButton
              type="button"
              color="cta"
              appearance="text"
              size="sm"
              onClick={() => {
                setExpandedId(null);
                void markAllAsRead();
              }}
            >
              همه را خواندم
            </KvButton>
          ) : null}
        </div>

        <div className="max-h-[min(16rem,45dvh)] min-h-0 overflow-y-auto overscroll-contain">
          {notifications.length === 0 ? (
            <div className="px-3.5 py-kv-section text-center">
              <KvTypography variant="caption" tone="muted" as="p">
                اعلانی وجود ندارد
              </KvTypography>
            </div>
          ) : (
            notifications.map((notification) => {
              const expandable = isExpandableNotification(notification);
              const expanded = expandedId === notification.id;
              const isUnread = !notification.read;

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
                    aria-expanded={expandable ? expanded : undefined}
                    onClick={() => {
                      if (isUnread) {
                        void markAsRead(notification.id);
                      }
                      if (expandable) {
                        setExpandedId((current) =>
                          current === notification.id ? null : notification.id
                        );
                      }
                    }}
                    className={cn(
                      'flex w-full flex-col gap-kv-micro px-3.5 py-2.5 text-start',
                      'transition-colors hover:bg-kv-surface-muted focus-visible:bg-kv-surface-muted',
                      'focus-visible:outline-none',
                      !expandable && 'cursor-default'
                    )}
                  >
                    <span className="flex w-full items-center gap-kv-pair">
                      {isUnread ? (
                        <span
                          className="size-1.5 shrink-0 rounded-full bg-kv-danger"
                          aria-hidden="true"
                        />
                      ) : (
                        <span
                          className="size-1.5 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <KvTypography
                          variant="caption"
                          tone="muted"
                          weight="bold"
                          as="span"
                          truncate
                        >
                          {notification.title}
                        </KvTypography>
                      </span>
                      <span className="origin-top-end shrink-0 scale-[0.85]" dir="rtl">
                        <KvTypography
                          variant="overline"
                          tone="disabled"
                          as="span"
                        >
                          {formatNotificationTime(notification.createdAt)}
                        </KvTypography>
                      </span>
                      {expandable ? (
                        <FaIcon
                          icon={faIcons.chevronDown}
                          size="2xs"
                          className={cn(
                            'shrink-0 text-kv-text-faint transition-transform',
                            expanded && 'rotate-180'
                          )}
                          aria-hidden
                        />
                      ) : null}
                    </span>

                    {expandable && expanded && notification.body ? (
                      <span className="w-full origin-start scale-[0.92] ps-3.5 [&_span]:leading-snug">
                        <KvTypography
                          variant="overline"
                          tone="disabled"
                          weight="medium"
                          as="span"
                        >
                          {notification.body}
                        </KvTypography>
                      </span>
                    ) : null}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </KvDropdownMenuContent>
    </KvDropdownMenu>
  );
}

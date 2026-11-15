'use client';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useId, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import {
  lockedNavAriaLabel,
  lockedNavTitle,
} from '@/components/shared/shell/shellCopy';
import {
  kvShellFocusRingClassName,
  kvShellRailLabelMaxClassName,
  kvShellRailLabelMotionClassName,
  kvShellRailNavTypeClassName,
  type KvShellRailTextSize,
} from '@/components/shared/shell/shellChrome';
import { isAdminReportsPath } from '@/features/karvita/reports/lib/report-path';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';
import type { SidebarMenuGroup } from '@/utils/RoleStrategyMap';
import { resolveActiveSidebarPath } from '@/utils/role-strategy/sidebar-active';
import { faIcons } from '@/utils/iconMap';

import { resolveSidebarIcon } from './resolveSidebarIcon';
import { SidebarNavLink } from './SidebarNavLink';

export type SidebarNavGroupProps = {
  group: SidebarMenuGroup;
  pathname: string;
  /** query فعلی؛ برای آیتم‌هایی که مسیرشان پارامتر دارد (`?kind=…&course=…`). */
  search?: string;
  isCollapsed: boolean;
  locked: boolean;
  /** مسیرهایی که فارغ از وضعیت گروه، به‌صورت مستقل قفل هستند (مثل سطح‌های انتخاب واحد). */
  lockedPaths?: ReadonlySet<string>;
  onNavigate: () => void;
  textSize?: KvShellRailTextSize;
  /** اگر فرزند فعال باشد گروه را باز نگه دار (مثلاً ریل دوم گزارش‌ها). */
  defaultOpenWhenActive?: boolean;
};

export function SidebarNavGroup({
  group,
  pathname,
  search = '',
  isCollapsed,
  locked,
  lockedPaths,
  onNavigate,
  textSize = 'compact',
  defaultOpenWhenActive = false,
}: SidebarNavGroupProps) {
  const activePath = locked
    ? null
    : resolveActiveSidebarPath(
        group.children.map((child) => child.path),
        pathname,
        search
      );
  // بسته شروع می‌شود؛ با `defaultOpenWhenActive` روی مسیر فعال همیشه باز می‌ماند.
  const [open, setOpen] = useState(
    () => defaultOpenWhenActive && activePath !== null
  );
  const groupId = useId();
  const groupIcon = resolveSidebarIcon(group.icon);
  const forceOpen = defaultOpenWhenActive && activePath !== null;
  const disclosureOpen = locked ? false : forceOpen || open;
  const expandSidebar = useUIStore((state) => state.toggleSidebarCollapsed);
  const reportsGroup = group.children.some((child) =>
    isAdminReportsPath(child.path)
  );
  const reportsRouteActive = reportsGroup && isAdminReportsPath(pathname);
  const childActive =
    !locked && (activePath !== null || reportsRouteActive);

  // ریل جمع‌شدهٔ دسکتاپ: همان درخت ریل باز می‌ماند و فقط لیبل/فلش/زیرمنو با ترنزیشن جمع می‌شوند
  // (قبلاً دو کامپوننت جدا جایگزین هم می‌شد و گروه‌ها با بقیهٔ آیتم‌ها هماهنگ جمع نمی‌شدند).
  // کلیک روی سر ماژول در ریل جمع‌شده → باز شدن ریل + افشای گروه.
  const handleToggle = () => {
    if (locked) return;
    if (
      isCollapsed &&
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 64rem)').matches
    ) {
      setOpen(true);
      expandSidebar();
      return;
    }
    setOpen((value) => !value);
  };

  return (
    <ExpandedGroupChrome
      group={group}
      groupIcon={groupIcon}
      groupId={groupId}
      open={disclosureOpen}
      onToggle={handleToggle}
      activePath={activePath}
      locked={locked}
      lockedPaths={lockedPaths}
      onNavigate={onNavigate}
      isCollapsed={false}
      textSize={textSize}
      railCollapsed={isCollapsed}
      railActive={childActive}
    />
  );
}

function ExpandedGroupChrome({
  group,
  groupIcon,
  groupId,
  open,
  onToggle,
  activePath,
  locked,
  lockedPaths,
  onNavigate,
  isCollapsed,
  textSize,
  railCollapsed = false,
  railActive = false,
}: {
  group: SidebarMenuGroup;
  groupIcon: IconDefinition;
  groupId: string;
  open: boolean;
  onToggle: () => void;
  activePath: string | null;
  locked: boolean;
  lockedPaths?: ReadonlySet<string>;
  onNavigate: () => void;
  isCollapsed: boolean;
  textSize: KvShellRailTextSize;
  /** ریل دسکتاپ جمع است: فقط آیکن می‌ماند (کلاس‌های `lg:`؛ موبایل همیشه باز). */
  railCollapsed?: boolean;
  /** سر گروه در ریل جمع‌شده فعال دیده شود (شامل مسیر گزارش‌ها). */
  railActive?: boolean;
}) {
  const childActive = !locked && activePath !== null;

  return (
    <div className="flex flex-col">
      {/*
        افشای گروه `L1` — دکمهٔ native (کروم آکاردئون، نه `CTA`).
        وقتی ماژول قفل است خود والد مثل برگ‌ها قفل دیده می‌شود.
        جمع‌شدن ریل: padding شروع (٪ عرض) + لیبل/فلش/زیرمنو همزمان با عرض ریل انیمیت می‌شوند.
      */}
      <button
        type="button"
        id={groupId}
        aria-expanded={locked ? undefined : open}
        aria-controls={locked ? undefined : `${groupId}-panel`}
        aria-disabled={locked || undefined}
        disabled={locked}
        aria-label={locked ? lockedNavAriaLabel(group.title) : undefined}
        title={
          locked
            ? lockedNavTitle(group.title)
            : railCollapsed
              ? group.title
              : undefined
        }
        onClick={onToggle}
        className={cn(
          'group flex w-full items-center justify-between rounded-kv-control px-kv-inline py-kv-nav font-semibold transition-[padding,color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          kvShellRailNavTypeClassName[textSize],
          kvShellFocusRingClassName,
          railCollapsed && 'lg:pe-0 lg:ps-[calc((100%_-_1.25rem)/2)]',
          locked
            ? 'cursor-not-allowed bg-kv-surface-muted/40 font-medium text-kv-text-faint opacity-40'
            : childActive
              ? 'text-kv-text hover:bg-kv-surface-muted'
              : 'text-kv-text-secondary hover:bg-kv-surface-muted hover:text-kv-text',
          railCollapsed &&
            railActive &&
            !locked &&
            'lg:bg-kv-brand-soft lg:text-kv-brand-soft-fg lg:ring-1 lg:ring-inset lg:ring-kv-brand-border lg:hover:bg-kv-brand-soft'
        )}
      >
        <span className="flex min-w-0 items-center">
          <FaIcon
            icon={groupIcon}
            size="sm"
            className={cn(
              'w-5 shrink-0 text-center transition-colors',
              locked
                ? 'text-kv-text-faint'
                : childActive || (railCollapsed && railActive)
                  ? 'text-kv-brand'
                  : 'text-kv-text-faint group-hover:text-kv-text-subtle'
            )}
          />
          <span
            className={cn(
              'ms-kv-inline truncate',
              kvShellRailLabelMaxClassName[textSize],
              kvShellRailLabelMotionClassName,
              railCollapsed && 'lg:ms-0 lg:max-w-0 lg:opacity-0'
            )}
          >
            {group.title}
          </span>
        </span>
        {!locked ? (
          <span
            aria-hidden
            className={cn(
              'flex max-w-4 shrink-0 overflow-hidden opacity-100 transition-[max-width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              railCollapsed && 'lg:max-w-0 lg:opacity-0'
            )}
          >
            <FaIcon
              icon={faIcons.chevronDown}
              size="2xs"
              className={cn(
                'shrink-0 text-kv-text-faint/80 transition-transform group-hover:text-kv-text-faint',
                open && 'rotate-180'
              )}
            />
          </span>
        ) : null}
      </button>

      {!locked && open ? (
        <div
          className={cn(
            'grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
            railCollapsed && 'lg:invisible lg:grid-rows-[0fr] lg:opacity-0'
          )}
        >
          <div className="min-h-0 overflow-hidden pt-kv-nav-tight">
            <div
              id={`${groupId}-panel`}
              role="group"
              aria-labelledby={groupId}
              className="ms-kv-group mt-kv-field space-y-kv-nav-tight border-s border-kv-border-muted ps-kv-inline"
            >
              {group.children.map((child) => (
                <SidebarNavLink
                  key={child.path}
                  item={child}
                  isActive={!locked && activePath === child.path}
                  isCollapsed={isCollapsed}
                  locked={
                    locked ||
                    Boolean(lockedPaths?.has(child.path)) ||
                    Boolean(child.disabled)
                  }
                  onNavigate={onNavigate}
                  nested
                  textSize={textSize}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

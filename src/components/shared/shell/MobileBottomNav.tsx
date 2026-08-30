'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { FaIcon } from '@/components/shared/FaIcon';
import { SidebarCourseIcon } from '@/components/shared/shell/SidebarCourseIcon';
import { kvScrollAreaHiddenClassName } from '@/components/shared/KvScrollArea';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/useUserStore';
import {
  areKarvitaModulesUnlocked,
  getVisibleSidebarMenu,
  isSidebarMenuGroup,
} from '@/utils/RoleStrategyMap';
import type { SidebarMenuEntry, SidebarMenuItem } from '@/utils/RoleStrategyMap';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { resolveSidebarIcon } from './resolveSidebarIcon';

/**
 * همه آیتم‌های منو را به لیست مسطح تبدیل می‌کند.
 * گروه‌ها: عنوان گروه به عنوان جداکننده + همه فرزندان.
 */
function flattenAllItems(entries: SidebarMenuEntry[]): SidebarMenuItem[] {
  const result: SidebarMenuItem[] = [];
  for (const entry of entries) {
    if (isSidebarMenuGroup(entry)) {
      result.push(...entry.children);
    } else {
      result.push(entry);
    }
  }
  return result;
}

/**
 * MobileNavBar — نوار منوی افقی زیر هدر برای موبایل و تبلت (lg:hidden).
 * همه آیتم‌های سایدبار را به صورت لینک‌های افقی اسکرول‌پذیر نشان می‌دهد.
 */
export function MobileBottomNav() {
  const activeUser = useUserStore((state) => state.activeUser);
  const pathname = usePathname();

  if (!activeUser) return null;

  const visibleMenu = getVisibleSidebarMenu(activeUser.role);
  const modulesUnlocked = areKarvitaModulesUnlocked(activeUser);
  const allItems = flattenAllItems(visibleMenu);

  if (allItems.length === 0) return null;

  return (
    <div
      className="sticky top-16 z-20 w-full border-b border-kv-border/80 bg-kv-surface/95 shadow-kv-soft backdrop-blur-md supports-[backdrop-filter]:bg-kv-surface/85 lg:hidden"
    >
      <nav aria-label="منوی اصلی">
        {/* اسکرول افقی بدون نمایش scrollbar */}
        <ul
          role="list"
          className={cn(
            'flex items-center gap-0.5 overflow-x-auto px-2 py-1.5',
            kvScrollAreaHiddenClassName
          )}
        >
          {allItems.map((item) => {
            const isActive = pathname === item.path;
            const isLocked = !modulesUnlocked;
            const icon = resolveSidebarIcon(item.icon);
            const hasCourseBadge = typeof item.iconBadge === 'number';

            return (
              <li key={item.path} className="shrink-0">
                <NavItem
                  item={item}
                  icon={icon}
                  hasCourseBadge={hasCourseBadge}
                  isActive={isActive}
                  isLocked={isLocked}
                />
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/* ─────────────────────────────────── NavItem ── */

function NavItem({
  item,
  icon,
  hasCourseBadge,
  isActive,
  isLocked,
}: {
  item: SidebarMenuItem;
  icon: IconDefinition;
  hasCourseBadge: boolean;
  isActive: boolean;
  isLocked: boolean;
}) {
  const iconTone = isLocked
    ? 'text-kv-text-faint'
    : isActive
      ? 'text-kv-brand'
      : 'text-kv-text-muted';

  const itemIcon = hasCourseBadge ? (
    <SidebarCourseIcon icon={icon} badge={item.iconBadge} iconClassName={iconTone} />
  ) : (
    <FaIcon icon={icon} size="sm" className={cn('shrink-0 transition-colors', iconTone)} />
  );

  const baseClass = cn(
    'flex items-center gap-1.5 whitespace-nowrap rounded-kv-control px-3 py-1.5 text-xs font-semibold transition-colors',
    'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20',
    isLocked
      ? 'cursor-not-allowed opacity-40 text-kv-text-faint bg-kv-surface-muted/40'
      : isActive
        ? 'bg-kv-brand-soft text-kv-brand-soft-fg border border-kv-brand-border'
        : 'text-kv-text-secondary hover:bg-kv-surface-muted hover:text-kv-text border border-transparent'
  );

  if (isLocked) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        aria-label={`${item.title} — غیرفعال`}
        className={baseClass}
      >
        {itemIcon}
        <span>{item.title}</span>
      </button>
    );
  }

  return (
    <Link
      href={item.path}
      prefetch
      aria-current={isActive ? 'page' : undefined}
      className={baseClass}
    >
      {itemIcon}
      <span>{item.title}</span>
    </Link>
  );
}

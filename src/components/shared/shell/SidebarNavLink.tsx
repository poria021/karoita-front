'use client';

import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import { SidebarCourseIcon } from '@/components/shared/shell/SidebarCourseIcon';
import {
  kvShellRailLabelMaxClassName,
  kvShellRailLabelMotionClassName,
  kvShellRailNavTypeClassName,
  type KvShellRailTextSize,
} from '@/components/shared/shell/shellChrome';
import { cn } from '@/lib/utils';
import type { SidebarMenuItem } from '@/utils/RoleStrategyMap';

import { resolveSidebarIcon } from './resolveSidebarIcon';

export type SidebarNavLinkProps = {
  item: SidebarMenuItem;
  isActive: boolean;
  isCollapsed: boolean;
  locked: boolean;
  onNavigate: () => void;
  /** `L2` زیر گروه — آرام‌تر از `L1`؛ سلسله‌مراتب با رنگ/وزن نه اندازه. */
  nested?: boolean;
  textSize?: KvShellRailTextSize;
};

export function SidebarNavLink({
  item,
  isActive,
  isCollapsed,
  locked,
  onNavigate,
  nested = false,
  textSize = 'compact',
}: SidebarNavLinkProps) {
  const itemIcon = resolveSidebarIcon(item.icon);
  const hasCourseBadge = typeof item.iconBadge === 'number';
  /** سایدبار باز: فرزند `L2` گلولهٔ آرام. ریل جمع: آیکن دوره. */
  const useBullet = nested && !isCollapsed;
  const hoverTitle = isCollapsed
    ? locked
      ? `${item.title} (غیرفعال)`
      : item.title
    : undefined;

  const iconTone = locked
    ? 'text-kv-text-faint'
    : isActive
      ? 'text-kv-brand'
      : 'text-kv-text-faint group-hover:text-kv-text-subtle';

  const bulletTone = locked
    ? 'bg-kv-border-strong'
    : isActive
      ? 'bg-kv-brand'
      : 'bg-kv-border-strong group-hover:bg-kv-text-faint';

  const content = (
    <div className={cn('flex min-w-0 items-center', useBullet && 'gap-2')}>
      {useBullet ? (
        <span
          aria-hidden
          className={cn(
            'size-1.5 shrink-0 rounded-full transition-colors',
            bulletTone
          )}
        />
      ) : hasCourseBadge ? (
        <SidebarCourseIcon
          icon={itemIcon}
          badge={item.iconBadge}
          iconClassName={iconTone}
        />
      ) : (
        <FaIcon
          icon={itemIcon}
          size="sm"
          className={cn('w-5 shrink-0 text-center transition-colors', iconTone)}
        />
      )}
      <span
        className={cn(
          'inline-block whitespace-nowrap',
          kvShellRailLabelMaxClassName[textSize],
          kvShellRailLabelMotionClassName,
          useBullet
            ? 'opacity-100'
            : isCollapsed
              ? 'ms-3 opacity-100 lg:ms-0 lg:max-w-0 lg:opacity-0'
              : 'ms-3 opacity-100'
        )}
      >
        {item.title}
      </span>
    </div>
  );

  const className = cn(
    'group flex w-full items-center rounded-kv-control transition-[padding,color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
    kvShellRailNavTypeClassName[textSize],
    'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20',
    useBullet ? 'px-3 py-2' : 'py-2.5',
    !useBullet && (isCollapsed ? 'px-3.5 lg:px-0' : 'px-3.5'),
    isCollapsed ? 'justify-start lg:justify-center' : 'justify-start text-start',
    locked
      ? 'cursor-not-allowed bg-kv-surface-muted/40 font-medium text-kv-text-faint opacity-40'
      : isActive
        ? /* فوکوس درخت — پر نرم + بردر داخلی روی هر ماژول فعال */
          'cursor-pointer border border-kv-brand-border bg-kv-brand-soft font-semibold text-kv-brand-soft-fg'
        : useBullet
          ? /* `L2` بیکار — زیر `L1` فرو می‌رود */
            textSize === 'legible'
              ? 'cursor-pointer border border-transparent font-medium text-kv-text-muted hover:bg-kv-surface-muted hover:text-kv-text-secondary'
              : 'cursor-pointer border border-transparent font-medium text-kv-text-faint hover:bg-kv-surface-muted hover:text-kv-text-secondary'
          : /* برگ `L1` بیکار */
            'cursor-pointer border border-transparent font-semibold text-kv-text-secondary hover:bg-kv-surface-muted hover:text-kv-text'
  );

  if (locked) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        aria-label={`${item.title} — غیرفعال تا تأیید مدارک`}
        title={hoverTitle}
        className={className}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={item.path}
      // هدف زندهٔ باز — prefetch برای حس SPA؛ قفل‌ها هرگز `Link` نیستند.
      prefetch
      onClick={onNavigate}
      aria-label={item.title}
      aria-current={isActive ? 'page' : undefined}
      title={hoverTitle}
      className={className}
    >
      {content}
    </Link>
  );
}

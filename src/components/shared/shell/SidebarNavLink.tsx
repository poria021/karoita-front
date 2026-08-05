'use client';

import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import { cn } from '@/lib/utils';
import type { SidebarMenuItem } from '@/utils/RoleStrategyMap';

import { resolveSidebarIcon } from './resolveSidebarIcon';

export type SidebarNavLinkProps = {
  item: SidebarMenuItem;
  isActive: boolean;
  isCollapsed: boolean;
  locked: boolean;
  onNavigate: () => void;
  /** L2 under a group — quieter than L1; hierarchy via color/weight, not size. */
  nested?: boolean;
};

export function SidebarNavLink({
  item,
  isActive,
  isCollapsed,
  locked,
  onNavigate,
  nested = false,
}: SidebarNavLinkProps) {
  const itemIcon = resolveSidebarIcon(item.icon);
  /** Digit course icons (fa-1…) stay visible under groups; other L2 use a quiet bullet. */
  const isDigitIcon = /^fa-[1-9]$/.test(item.icon);
  const useBullet = nested && !isCollapsed && !isDigitIcon;
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
      ) : (
        <FaIcon
          icon={itemIcon}
          size="sm"
          className={cn('w-5 shrink-0 text-center transition-colors', iconTone)}
        />
      )}
      <span
        className={cn(
          'inline-block max-w-[150px] overflow-hidden whitespace-nowrap transition-all',
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
    'group flex w-full items-center rounded-kv-control text-xs leading-snug transition-colors',
    'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20',
    useBullet ? 'px-3 py-2' : 'py-2.5',
    !useBullet && (isCollapsed ? 'px-3.5 lg:px-0' : 'px-3.5'),
    isCollapsed ? 'justify-start lg:justify-center' : 'justify-start text-start',
    locked
      ? 'cursor-not-allowed bg-kv-surface-muted/40 font-medium text-kv-text-faint opacity-40'
      : isActive
        ? /* Focus of the tree — soft fill + inner border on every active module */
          'cursor-pointer border border-kv-brand-border bg-kv-brand-soft font-semibold text-kv-brand-soft-fg'
        : useBullet
          ? /* L2 idle — recedes under L1 */
            'cursor-pointer border border-transparent font-medium text-kv-text-faint hover:bg-kv-surface-muted hover:text-kv-text-secondary'
          : /* L1 leaf idle */
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
      prefetch={false}
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

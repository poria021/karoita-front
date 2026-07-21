'use client';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useEffect, useId, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { cn } from '@/lib/utils';
import type { SidebarMenuGroup } from '@/utils/RoleStrategyMap';
import { faIcons } from '@/utils/iconMap';

import { resolveSidebarIcon } from './resolveSidebarIcon';
import { SidebarNavLink } from './SidebarNavLink';

export type SidebarNavGroupProps = {
  group: SidebarMenuGroup;
  pathname: string;
  isCollapsed: boolean;
  locked: boolean;
  onNavigate: () => void;
};

export function SidebarNavGroup({
  group,
  pathname,
  isCollapsed,
  locked,
  onNavigate,
}: SidebarNavGroupProps) {
  const childActive = group.children.some((child) => child.path === pathname);
  const [open, setOpen] = useState(childActive);
  const groupId = useId();

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  const groupIcon = resolveSidebarIcon(group.icon);

  // Collapsed rail: expose children as icon links so both modules stay reachable.
  if (isCollapsed) {
    return (
      <div className="space-y-3 max-lg:contents lg:block">
        <div className="hidden lg:contents">
          {group.children.map((child) => (
            <SidebarNavLink
              key={child.path}
              item={child}
              isActive={pathname === child.path}
              isCollapsed
              locked={locked}
              onNavigate={onNavigate}
            />
          ))}
        </div>
        <div className="space-y-1 lg:hidden">
          <ExpandedGroupChrome
            group={group}
            groupIcon={groupIcon}
            groupId={groupId}
            open={open}
            onToggle={() => setOpen((value) => !value)}
            pathname={pathname}
            locked={locked}
            onNavigate={onNavigate}
            isCollapsed={false}
          />
        </div>
      </div>
    );
  }

  return (
    <ExpandedGroupChrome
      group={group}
      groupIcon={groupIcon}
      groupId={groupId}
      open={open}
      onToggle={() => setOpen((value) => !value)}
      pathname={pathname}
      locked={locked}
      onNavigate={onNavigate}
      isCollapsed={false}
    />
  );
}

function ExpandedGroupChrome({
  group,
  groupIcon,
  groupId,
  open,
  onToggle,
  pathname,
  locked,
  onNavigate,
  isCollapsed,
}: {
  group: SidebarMenuGroup;
  groupIcon: IconDefinition;
  groupId: string;
  open: boolean;
  onToggle: () => void;
  pathname: string;
  locked: boolean;
  onNavigate: () => void;
  isCollapsed: boolean;
}) {
  const childActive = group.children.some((child) => child.path === pathname);

  return (
    <div className="space-y-1">
      {/* L1 — group label: darkest text, medium-strong weight; icon quieter than label */}
      <button
        type="button"
        id={groupId}
        aria-expanded={open}
        aria-controls={`${groupId}-panel`}
        onClick={onToggle}
        className={cn(
          'group flex w-full items-center justify-between rounded-kv-control px-3.5 py-2.5 text-xs font-semibold leading-snug transition-colors',
          'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20',
          childActive
            ? 'text-kv-text hover:bg-kv-surface-muted'
            : 'text-kv-text-secondary hover:bg-kv-surface-muted hover:text-kv-text'
        )}
      >
        <span className="flex min-w-0 items-center">
          <FaIcon
            icon={groupIcon}
            size="sm"
            className={cn(
              'w-5 shrink-0 text-center transition-colors',
              childActive
                ? 'text-kv-brand'
                : 'text-kv-text-faint group-hover:text-kv-text-subtle'
            )}
          />
          <span className="ms-3 max-w-[150px] truncate">{group.title}</span>
        </span>
        <FaIcon
          icon={faIcons.chevronDown}
          size="2xs"
          className={cn(
            'shrink-0 text-kv-text-faint/80 transition-transform group-hover:text-kv-text-faint',
            open && 'rotate-180'
          )}
        />
      </button>

      {open ? (
        <div
          id={`${groupId}-panel`}
          role="group"
          aria-labelledby={groupId}
          className="ms-4 mt-1.5 space-y-1 overflow-hidden border-s border-kv-border-muted ps-3"
        >
          {group.children.map((child) => (
            <SidebarNavLink
              key={child.path}
              item={child}
              isActive={pathname === child.path}
              isCollapsed={isCollapsed}
              locked={locked}
              onNavigate={onNavigate}
              nested
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

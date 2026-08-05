'use client';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useId, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import {
  lockedNavAriaLabel,
  lockedNavTitle,
} from '@/components/shared/shell/shellCopy';
import { kvShellFocusRingClassName } from '@/components/shared/shell/shellChrome';
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
  const childActive =
    !locked && group.children.some((child) => child.path === pathname);
  const [open, setOpen] = useState(childActive);
  const [prevChildActive, setPrevChildActive] = useState(childActive);
  const groupId = useId();

  if (childActive !== prevChildActive) {
    setPrevChildActive(childActive);
    if (childActive) setOpen(true);
  }

  const groupIcon = resolveSidebarIcon(group.icon);
  const disclosureOpen = locked ? false : open;

  // Collapsed rail: expose children as icon links so both modules stay reachable.
  if (isCollapsed) {
    return (
      <div className="space-y-kv-inline max-lg:contents lg:block">
        <div className="hidden lg:contents">
          {group.children.map((child) => (
            <SidebarNavLink
              key={child.path}
              item={child}
              isActive={!locked && pathname === child.path}
              isCollapsed
              locked={locked}
              onNavigate={onNavigate}
            />
          ))}
        </div>
        <div className="space-y-kv-nav-tight lg:hidden">
          <ExpandedGroupChrome
            group={group}
            groupIcon={groupIcon}
            groupId={groupId}
            open={disclosureOpen}
            onToggle={() => {
              if (locked) return;
              setOpen((value) => !value);
            }}
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
      open={disclosureOpen}
      onToggle={() => {
        if (locked) return;
        setOpen((value) => !value);
      }}
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
  const childActive =
    !locked && group.children.some((child) => child.path === pathname);

  return (
    <div className="space-y-kv-nav-tight">
      {/*
        L1 group disclosure — native button (accordion chrome, not a CTA).
        When modules are gated, the parent itself looks locked like leaf panels.
      */}
      <button
        type="button"
        id={groupId}
        aria-expanded={locked ? undefined : open}
        aria-controls={locked ? undefined : `${groupId}-panel`}
        aria-disabled={locked || undefined}
        disabled={locked}
        aria-label={locked ? lockedNavAriaLabel(group.title) : undefined}
        title={locked ? lockedNavTitle(group.title) : undefined}
        onClick={onToggle}
        className={cn(
          'group flex w-full items-center justify-between rounded-kv-control px-kv-inline py-kv-nav text-xs font-semibold leading-snug transition-colors',
          kvShellFocusRingClassName,
          locked
            ? 'cursor-not-allowed bg-kv-surface-muted/40 font-medium text-kv-text-faint opacity-40'
            : childActive
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
              locked
                ? 'text-kv-text-faint'
                : childActive
                  ? 'text-kv-brand'
                  : 'text-kv-text-faint group-hover:text-kv-text-subtle'
            )}
          />
          <span className="ms-kv-inline max-w-[150px] truncate">{group.title}</span>
        </span>
        {!locked ? (
          <FaIcon
            icon={faIcons.chevronDown}
            size="2xs"
            className={cn(
              'shrink-0 text-kv-text-faint/80 transition-transform group-hover:text-kv-text-faint',
              open && 'rotate-180'
            )}
          />
        ) : null}
      </button>

      {!locked && open ? (
        <div
          id={`${groupId}-panel`}
          role="group"
          aria-labelledby={groupId}
          className="ms-kv-group mt-kv-field space-y-kv-nav-tight overflow-hidden border-s border-kv-border-muted ps-kv-inline"
        >
          {group.children.map((child) => (
            <SidebarNavLink
              key={child.path}
              item={child}
              isActive={!locked && pathname === child.path}
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

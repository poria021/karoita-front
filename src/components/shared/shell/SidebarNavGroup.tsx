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
  kvShellRailNavTypeClassName,
  type KvShellRailTextSize,
} from '@/components/shared/shell/shellChrome';
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
  /** مسیرهایی که فارغ از وضعیت گروه، به‌صورت مستقل قفل هستند (مثل سطح‌های انتخاب واحد). */
  lockedPaths?: ReadonlySet<string>;
  onNavigate: () => void;
  textSize?: KvShellRailTextSize;
};

export function SidebarNavGroup({
  group,
  pathname,
  isCollapsed,
  locked,
  lockedPaths,
  onNavigate,
  textSize = 'compact',
}: SidebarNavGroupProps) {
  const childActive =
    !locked && group.children.some((child) => child.path === pathname);
  // گروه با زیرماژول از ابتدا باز باشد تا فرزندان دیده شوند.
  const [open, setOpen] = useState(true);
  const [prevChildActive, setPrevChildActive] = useState(childActive);
  const groupId = useId();

  if (childActive !== prevChildActive) {
    setPrevChildActive(childActive);
    if (childActive) setOpen(true);
  }

  const groupIcon = resolveSidebarIcon(group.icon);
  const disclosureOpen = locked ? false : open;

  // ریل جمع‌شده: فرزندان را لینک آیکن کن تا هر دو ماژول در دسترس بمانند.
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
              locked={locked || Boolean(lockedPaths?.has(child.path))}
              onNavigate={onNavigate}
              textSize={textSize}
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
            lockedPaths={lockedPaths}
            onNavigate={onNavigate}
            isCollapsed={false}
            textSize={textSize}
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
      lockedPaths={lockedPaths}
      onNavigate={onNavigate}
      isCollapsed={false}
      textSize={textSize}
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
  lockedPaths,
  onNavigate,
  isCollapsed,
  textSize,
}: {
  group: SidebarMenuGroup;
  groupIcon: IconDefinition;
  groupId: string;
  open: boolean;
  onToggle: () => void;
  pathname: string;
  locked: boolean;
  lockedPaths?: ReadonlySet<string>;
  onNavigate: () => void;
  isCollapsed: boolean;
  textSize: KvShellRailTextSize;
}) {
  const childActive =
    !locked && group.children.some((child) => child.path === pathname);

  return (
    <div className="space-y-kv-nav-tight">
      {/*
        افشای گروه `L1` — دکمهٔ native (کروم آکاردئون، نه `CTA`).
        وقتی ماژول قفل است خود والد مثل برگ‌ها قفل دیده می‌شود.
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
          'group flex w-full items-center justify-between rounded-kv-control px-kv-inline py-kv-nav font-semibold transition-colors',
          kvShellRailNavTypeClassName[textSize],
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
          <span
            className={cn(
              'ms-kv-inline truncate',
              kvShellRailLabelMaxClassName[textSize]
            )}
          >
            {group.title}
          </span>
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
              locked={locked || Boolean(lockedPaths?.has(child.path))}
              onNavigate={onNavigate}
              nested
              textSize={textSize}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

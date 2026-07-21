'use client';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { RouteService } from '@/services/route.service';
import { useUIStore } from '@/store/useUIStore';
import { useUserStore } from '@/store/useUserStore';
import {
  areKarvitaModulesUnlocked,
  getRoleStrategy,
  getVisibleSidebarMenu,
  isSidebarMenuGroup,
  type SidebarMenuGroup,
  type SidebarMenuItem,
} from '@/utils/RoleStrategyMap';
import { faIcons, iconMap } from '@/utils/iconMap';

function resolveIcon(iconKey: string): IconDefinition {
  return iconMap[iconKey] ?? faIcons.tableColumns;
}

export function Sidebar() {
  const activeUser = useUserStore((state) => state.activeUser);
  const isCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const isMobileOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const toggleCollapsed = useUIStore((state) => state.toggleSidebarCollapsed);
  const closeMobileSidebar = useUIStore((state) => state.closeMobileSidebar);
  const pathname = usePathname();
  const drawerTitleId = useId();
  const drawerRef = useRef<HTMLElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isMobileOpen) return;

    previouslyFocused.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const drawer = drawerRef.current;
    const focusable = drawer?.querySelector<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileSidebar();
        return;
      }
      if (event.key !== 'Tab' || !drawer) return;

      const nodes = Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
      ).filter((node) => !node.hasAttribute('disabled'));
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [isMobileOpen, closeMobileSidebar]);

  if (!activeUser) return null;

  const strategy = getRoleStrategy(activeUser.role);
  const visibleMenu = getVisibleSidebarMenu(activeUser.role);
  const roleIcon = resolveIcon(strategy.roleIcon);
  const modulesUnlocked = areKarvitaModulesUnlocked(activeUser);
  const profileHref = RouteService.karvita.profile(activeUser.role);

  return (
    <>
      <div
        onClick={closeMobileSidebar}
        aria-hidden={!isMobileOpen}
        className={cn(
          'fixed inset-0 z-40 bg-kv-surface-inverse/40 transition-opacity lg:hidden',
          isMobileOpen
            ? 'pointer-events-auto cursor-pointer opacity-100'
            : 'pointer-events-none opacity-0'
        )}
      />

      <aside
        ref={drawerRef}
        id="karvita-sidebar"
        role={isMobileOpen ? 'dialog' : undefined}
        aria-modal={isMobileOpen ? true : undefined}
        aria-labelledby={isMobileOpen ? drawerTitleId : undefined}
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex shrink-0 flex-col overflow-y-auto border-e border-kv-border/80 bg-kv-surface transition-all duration-300 ease-in-out',
          'lg:sticky lg:top-[calc(4rem+var(--spacing-kv-group))] lg:z-0 lg:h-auto lg:translate-x-0 lg:self-start lg:overflow-y-visible lg:pointer-events-auto lg:visible lg:bg-kv-surface lg:border lg:border-kv-border/80 lg:rounded-kv-shell lg:shadow-kv-raised',
          isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
          !isMobileOpen && 'max-lg:pointer-events-none max-lg:invisible',
          isCollapsed ? 'w-72 lg:w-20' : 'w-72 lg:w-60'
        )}
      >
        <KvButton
          type="button"
          color="neutral"
          appearance="ghost"
          size="sm"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? 'باز کردن نوار کناری' : 'جمع کردن نوار کناری'}
          className="absolute -end-3 top-6 z-20 hidden size-7 min-h-0 rounded-kv-control border border-kv-border-strong/80 bg-kv-surface p-0 text-kv-text-subtle shadow-kv-raised hover:border-kv-brand hover:text-kv-brand lg:flex"
          icon={
            <FaIcon
              icon={faIcons.chevronLeft}
              size="xs"
              className={cn(
                'transition-transform duration-300',
                isCollapsed ? 'rotate-180 rtl:rotate-0' : 'rotate-0 rtl:rotate-180'
              )}
            />
          }
        />

        <div className="flex items-center justify-between gap-3 border-b border-kv-border-muted p-4 lg:hidden">
          <div className="flex min-w-0 items-center gap-kv-inline">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand text-kv-brand-fg shadow-kv-raised shadow-kv-brand/20">
              <FaIcon icon={faIcons.tableColumns} size="sm" />
            </div>
            <div className="flex min-w-0 flex-col text-start">
              <KvTypography variant="subtitle" as="h2" id={drawerTitleId} truncate>
                پنل کاربری - {strategy.label}
              </KvTypography>
              <div className="mt-1">
                <KvTypography variant="overline" tone="muted" as="p" truncate>
                  سامانه جامع کارویتا
                </KvTypography>
              </div>
            </div>
          </div>
          <KvButton
            type="button"
            color="neutral"
            appearance="ghost"
            size="md"
            onClick={closeMobileSidebar}
            aria-label="بستن منو"
            className="shrink-0 rounded-full bg-kv-surface-subtle text-kv-text-subtle hover:bg-kv-danger-soft hover:text-kv-danger"
            icon={<FaIcon icon={faIcons.xmark} size="sm" />}
          />
        </div>

        <nav
          className="flex-1 space-y-3 overflow-y-auto p-4 lg:overflow-y-visible lg:p-3 lg:pt-5 lg:pb-8"
          aria-label="منوی اصلی"
        >
          {visibleMenu.map((entry) =>
            isSidebarMenuGroup(entry) ? (
              <SidebarNavGroup
                key={`group:${entry.title}`}
                group={entry}
                pathname={pathname}
                isCollapsed={isCollapsed}
                locked={!modulesUnlocked}
                onNavigate={closeMobileSidebar}
              />
            ) : (
              <SidebarNavLink
                key={entry.path}
                item={entry}
                isActive={pathname === entry.path}
                isCollapsed={isCollapsed}
                locked={!modulesUnlocked}
                onNavigate={closeMobileSidebar}
              />
            )
          )}
        </nav>

        <Link
          href={profileHref}
          prefetch={false}
          onClick={closeMobileSidebar}
          aria-label={`پروفایل ${activeUser.firstName} ${activeUser.lastName}`}
          className={cn(
            'border-t border-kv-border-muted bg-kv-surface transition-colors hover:bg-kv-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring/30 lg:rounded-b-kv-shell',
            isCollapsed ? 'p-4 lg:p-2' : 'p-4'
          )}
        >
          <div
            className={cn(
              'flex items-center rounded-kv-control border border-kv-border-muted bg-kv-surface-muted transition-all',
              isCollapsed
                ? 'justify-start p-3 lg:justify-center lg:p-2'
                : 'p-3'
            )}
          >
            <div className="relative flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand/10 text-kv-brand-soft-fg">
              <FaIcon icon={roleIcon} size="sm" />
            </div>
            <div
              className={cn(
                'flex min-w-0 flex-col overflow-hidden transition-all',
                isCollapsed
                  ? 'ms-3 max-w-[150px] opacity-100 lg:ms-0 lg:max-w-0 lg:opacity-0'
                  : 'ms-3 max-w-[150px] opacity-100'
              )}
            >
              <KvTypography variant="subtitle" as="p" truncate>
                {activeUser.firstName} {activeUser.lastName}
              </KvTypography>
              <div className="mt-0.5">
                <KvTypography variant="caption" tone="muted" as="p" truncate>
                  {strategy.label}
                </KvTypography>
              </div>
            </div>
          </div>
        </Link>
      </aside>
    </>
  );
}

interface SidebarNavGroupProps {
  group: SidebarMenuGroup;
  pathname: string;
  isCollapsed: boolean;
  locked: boolean;
  onNavigate: () => void;
}

function SidebarNavGroup({
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

  const groupIcon = resolveIcon(group.icon);

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

interface SidebarNavLinkProps {
  item: SidebarMenuItem;
  isActive: boolean;
  isCollapsed: boolean;
  locked: boolean;
  onNavigate: () => void;
  /** L2 under a group — quieter than L1; hierarchy via color/weight, not size. */
  nested?: boolean;
}

function SidebarNavLink({
  item,
  isActive,
  isCollapsed,
  locked,
  onNavigate,
  nested = false,
}: SidebarNavLinkProps) {
  const itemIcon = resolveIcon(item.icon);
  const useBullet = nested && !isCollapsed;

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
        ? /* Focus of the tree — strongest signal */
          useBullet
            ? 'cursor-pointer bg-kv-brand-soft font-semibold text-kv-brand-soft-fg'
            : 'cursor-pointer border border-kv-brand-border/50 bg-kv-brand-soft font-semibold text-kv-brand-soft-fg'
        : useBullet
          ? /* L2 idle — recedes under L1 */
            'cursor-pointer font-medium text-kv-text-faint hover:bg-kv-surface-muted hover:text-kv-text-secondary'
          : /* L1 leaf idle */
            'cursor-pointer font-semibold text-kv-text-secondary hover:bg-kv-surface-muted hover:text-kv-text'
  );

  const control = locked ? (
    <button
      type="button"
      disabled
      aria-disabled="true"
      aria-label={`${item.title} — غیرفعال تا تأیید مدارک`}
      className={className}
    >
      {content}
    </button>
  ) : (
    <Link
      href={item.path}
      prefetch={false}
      onClick={onNavigate}
      aria-label={item.title}
      aria-current={isActive ? 'page' : undefined}
      className={className}
    >
      {content}
    </Link>
  );

  if (!isCollapsed) return control;

  const trigger = locked ? (
    <span className="block w-full">{control}</span>
  ) : (
    control
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent side="left" sideOffset={8}>
        {locked ? `${item.title} (غیرفعال)` : item.title}
      </TooltipContent>
    </Tooltip>
  );
}

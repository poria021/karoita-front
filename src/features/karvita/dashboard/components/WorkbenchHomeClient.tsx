'use client';

import Link from 'next/link';

import { FaIcon } from '@/components/shared/FaIcon';
import { OnboardingChecklist } from '@/components/shared/shell/OnboardingChecklist';
import { KvTypography } from '@/components/shared/KvTypography';
import { useSidebarMenu } from '@/components/shared/shell/useSidebarMenu';
import { useUserStore } from '@/store/useUserStore';
import { faIcons } from '@/utils/iconMap';
import {
  getOnboardingProgress,
  shouldShowOnboardingChecklist,
} from '@/utils/onboardingProgress';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';
import { getLiveWorkbenchShortcuts } from '@/utils/workbenchShortcuts';

import {
  WORKBENCH_FULL_SPAN,
  WORKBENCH_GRID_CLASS,
  WORKBENCH_SHORTCUTS_GRID_CLASS,
} from '@/lib/workbench-grid';
import { cn } from '@/lib/utils';

import { DashboardWidgetGrid } from './DashboardWidgetGrid';

export type WorkbenchHomeProps = {
  /** خط خوشامد زیر عنوان (رونوشت مستقل از نقش). */
  subtitle: string;
  emptyDescription: string;
};

function resolveShortcutIcon(iconName?: string) {
  if (!iconName) return faIcons.folderOpen;
  const key = iconName
    .replace(/^fa-/, '')
    .replace(/-([a-z])/g, (_, c) => c.toUpperCase()) as keyof typeof faIcons;
  return (
    faIcons[key] ??
    (faIcons as Record<string, typeof faIcons.folderOpen>)[iconName] ??
    faIcons.folderOpen
  );
}

/**
 * میز کار سازمانی آرام — یک گرید مشترک برای خوش‌آمد، اطلاعیه‌ها، تبلیغ و میان‌برها.
 */
export function WorkbenchHomeClient({
  subtitle,
  emptyDescription,
}: WorkbenchHomeProps) {
  const activeUser = useUserStore((state) => state.activeUser);
  const menu = useSidebarMenu(activeUser?.role);
  if (!activeUser) return null;

  const strategy = getRoleStrategy(activeUser.role);
  const shortcuts = getLiveWorkbenchShortcuts(activeUser.role, menu);
  const displayName =
    [activeUser.firstName, activeUser.lastName].filter(Boolean).join(' ') ||
    strategy.label;
  const welcomeOrgLine = [
    activeUser.province?.filter(Boolean).join('، '),
    activeUser.college?.filter(Boolean).join('، '),
  ]
    .filter(Boolean)
    .join(' · ');
  const showChecklist = shouldShowOnboardingChecklist(activeUser);
  const progress = showChecklist
    ? getOnboardingProgress({
        role: activeUser.role,
        approved: activeUser.approved,
        docStatus: activeUser.docStatus,
      })
    : null;

  const learnerWorkbench =
    activeUser.role === 'student' || activeUser.role === 'skill_learner';

  return (
    <div className={WORKBENCH_GRID_CLASS}>
      {/* دانشجو/مهارت‌آموز: خوش‌آمد بالاتر از چک‌لیست و بقیهٔ ویجت‌ها */}
      {learnerWorkbench ? (
        <DashboardWidgetGrid
          role={activeUser.role}
          welcomeName={displayName}
          welcomeSubtitle={subtitle}
          welcomeOrgLine={welcomeOrgLine || null}
        />
      ) : null}

      {progress ? (
        <div className={WORKBENCH_FULL_SPAN}>
          <OnboardingChecklist progress={progress} />
        </div>
      ) : null}

      {!learnerWorkbench ? (
        <DashboardWidgetGrid
          role={activeUser.role}
          welcomeName={displayName}
          welcomeSubtitle={subtitle}
          welcomeOrgLine={welcomeOrgLine || null}
        />
      ) : null}

      {!learnerWorkbench ? (
        shortcuts.length === 0 ? (
          <div
            className={cn(
              WORKBENCH_FULL_SPAN,
              'rounded-kv-panel border border-kv-border bg-kv-surface p-kv-section'
            )}
          >
            <KvTypography variant="subtitle" as="p">
              میان‌بر فعالی نیست
            </KvTypography>
            <div className="mt-kv-pair">
              <KvTypography variant="body" tone="muted" as="p">
                {emptyDescription}
              </KvTypography>
            </div>
          </div>
        ) : (
          <nav aria-label="میان‌برهای میز کار" className={WORKBENCH_FULL_SPAN}>
            <ul className={WORKBENCH_SHORTCUTS_GRID_CLASS}>
              {shortcuts.map((item) => {
                const icon = resolveShortcutIcon(item.icon);
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      prefetch
                      className="flex min-h-11 items-center gap-kv-inline rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group text-start shadow-kv-raised transition-colors hover:border-kv-border-strong hover:bg-kv-surface-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand">
                        <FaIcon icon={icon} size="sm" />
                      </span>
                      <KvTypography variant="subtitle" as="span" truncate>
                        {item.title}
                      </KvTypography>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )
      ) : null}
    </div>
  );
}

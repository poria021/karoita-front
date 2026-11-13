'use client';

import { OnboardingChecklist } from '@/components/shared/shell/OnboardingChecklist';
import { workbenchBoardShowsAd } from '@/features/karvita/bulletins/components/DashboardBulletinsBoard';
import { useDashboardBulletins } from '@/features/karvita/bulletins/hooks/useDashboardBulletins';
import { useUserStore } from '@/store/useUserStore';
import {
  getOnboardingProgress,
  shouldShowOnboardingChecklist,
} from '@/utils/onboardingProgress';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

import {
  WORKBENCH_FULL_ROW_PLACEMENT,
  workbenchCellClass,
  workbenchShellClass,
} from '@/lib/workbench-grid';
import type { UserRole } from '@/types/auth';

import { DashboardWidgetGrid } from './DashboardWidgetGrid';

/**
 * میز کار — شِل ۱۲ستونه؛ باکس‌ها با col/row-span از نقشهٔ گرید.
 */
export function WorkbenchHomeClient() {
  const activeUser = useUserStore((state) => state.activeUser);
  if (!activeUser) return null;

  const strategy = getRoleStrategy(activeUser.role);
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
    <WorkbenchHomeShell
      role={activeUser.role}
      learnerWorkbench={learnerWorkbench}
      welcomeName={displayName}
      welcomeOrgLine={welcomeOrgLine || null}
      progress={progress}
    />
  );
}

function WorkbenchHomeShell({
  role,
  learnerWorkbench,
  welcomeName,
  welcomeOrgLine,
  progress,
}: {
  role: UserRole;
  learnerWorkbench: boolean;
  welcomeName: string;
  welcomeOrgLine: string | null;
  progress: ReturnType<typeof getOnboardingProgress> | null;
}) {
  const data = useDashboardBulletins(role);
  const showAd = workbenchBoardShowsAd(role, data.ads);
  const fullRowClass = workbenchCellClass(WORKBENCH_FULL_ROW_PLACEMENT);

  return (
    <div className={workbenchShellClass(showAd)}>
      {learnerWorkbench ? (
        <DashboardWidgetGrid
          role={role}
          welcomeName={welcomeName}
          welcomeOrgLine={welcomeOrgLine}
        />
      ) : null}

      {progress ? (
        <div className={fullRowClass}>
          <OnboardingChecklist progress={progress} />
        </div>
      ) : null}

      {!learnerWorkbench ? (
        <DashboardWidgetGrid
          role={role}
          welcomeName={welcomeName}
          welcomeOrgLine={welcomeOrgLine}
        />
      ) : null}
    </div>
  );
}

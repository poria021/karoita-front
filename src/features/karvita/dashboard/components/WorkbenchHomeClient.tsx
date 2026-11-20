'use client';

import { OnboardingChecklist } from '@/components/shared/shell/OnboardingChecklist';
import { workbenchBoardShowsAd } from '@/features/karvita/bulletins/components/DashboardBulletinsBoard';
import { useUserStore } from '@/store/useUserStore';
import {
  getOnboardingProgress,
  shouldShowOnboardingChecklist,
} from '@/utils/onboardingProgress';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

import {
  WORKBENCH_FULL_ROW_PLACEMENT,
  workbenchCellClass,
  WORKBENCH_LEARNER_MOBILE_CLASS,
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
      progress={progress}
    />
  );
}

function WorkbenchHomeShell({
  role,
  learnerWorkbench,
  welcomeName,
  progress,
}: {
  role: UserRole;
  learnerWorkbench: boolean;
  welcomeName: string;
  progress: ReturnType<typeof getOnboardingProgress> | null;
}) {
  const showAd = workbenchBoardShowsAd(role);
  const fullRowClass = workbenchCellClass(WORKBENCH_FULL_ROW_PLACEMENT);

  return (
    <div
      className={[
        workbenchShellClass(
          showAd,
          role === 'regional_edu_admin' ||
            role === 'faculty_role' ||
            role === 'provincial_university'
        ),
        learnerWorkbench ? WORKBENCH_LEARNER_MOBILE_CLASS : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {learnerWorkbench ? (
        <DashboardWidgetGrid role={role} welcomeName={welcomeName} />
      ) : null}

      {progress ? (
        <div className={fullRowClass}>
          <OnboardingChecklist progress={progress} />
        </div>
      ) : null}

      {!learnerWorkbench ? (
        <DashboardWidgetGrid role={role} welcomeName={welcomeName} />
      ) : null}
    </div>
  );
}

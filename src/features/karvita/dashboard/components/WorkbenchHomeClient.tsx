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

  const showAd = workbenchBoardShowsAd(activeUser.role);
  const fullRowClass = workbenchCellClass(WORKBENCH_FULL_ROW_PLACEMENT);
  const learnerWorkbench =
    activeUser.role === 'student' || activeUser.role === 'skill_learner';

  return (
    <div
      className={[
        workbenchShellClass(
          showAd,
          activeUser.role === 'regional_edu_admin' ||
            activeUser.role === 'faculty_role' ||
            activeUser.role === 'provincial_university'
        ),
        learnerWorkbench ? WORKBENCH_LEARNER_MOBILE_CLASS : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {learnerWorkbench ? (
        <DashboardWidgetGrid
          role={activeUser.role}
          welcomeName={displayName}
        />
      ) : null}

      {progress ? (
        <div className={fullRowClass}>
          <OnboardingChecklist progress={progress} />
        </div>
      ) : null}

      {!learnerWorkbench ? (
        <DashboardWidgetGrid
          role={activeUser.role}
          welcomeName={displayName}
        />
      ) : null}
    </div>
  );
}

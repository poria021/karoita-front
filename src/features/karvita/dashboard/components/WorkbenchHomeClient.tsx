'use client';

import { OnboardingChecklist } from '@/components/shared/shell/OnboardingChecklist';
import { useUserStore } from '@/store/useUserStore';
import {
  getOnboardingProgress,
  shouldShowOnboardingChecklist,
} from '@/utils/onboardingProgress';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

import { WORKBENCH_FULL_SPAN, WORKBENCH_GRID_CLASS } from '@/lib/workbench-grid';

import { DashboardWidgetGrid } from './DashboardWidgetGrid';

/**
 * میز کار سازمانی آرام — خوش‌آمد، اطلاعیه‌ها، تبلیغ و ویجت‌های نقش.
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
    <div className={WORKBENCH_GRID_CLASS}>
      {/* دانشجو/مهارت‌آموز: خوش‌آمد بالاتر از چک‌لیست و بقیهٔ ویجت‌ها */}
      {learnerWorkbench ? (
        <DashboardWidgetGrid
          role={activeUser.role}
          welcomeName={displayName}
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
          welcomeOrgLine={welcomeOrgLine || null}
        />
      ) : null}
    </div>
  );
}

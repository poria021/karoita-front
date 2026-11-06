'use client';

import { DashboardBulletinsBoard } from '@/features/karvita/bulletins/components/DashboardBulletinsBoard';
import type { UserRole } from '@/types/auth';

import {
  getDashboardWidgets,
  type DashboardWidgetId,
} from '../lib/dashboard-widgets';
import { DashboardLearnerGradesChart } from './DashboardLearnerGradesChart';
import { WorkbenchWelcomeBox } from './WorkbenchWelcomeBox';

type DashboardWidgetGridProps = {
  role: UserRole;
  welcomeName: string;
  welcomeOrgLine?: string | null;
};

/**
 * سلول‌های ویجت میز کار برای قرار گرفتن داخل `WORKBENCH_GRID_CLASS`.
 * خودِ گرید بیرونی در `WorkbenchHomeClient` است تا میان‌برها هم همان ریتم را بگیرند.
 */
export function DashboardWidgetGrid({
  role,
  welcomeName,
  welcomeOrgLine,
}: DashboardWidgetGridProps) {
  return (
    <>
      {getDashboardWidgets(role).map((widget) => (
        <DashboardWidget
          key={widget.id}
          id={widget.id}
          role={role}
          welcomeName={welcomeName}
          welcomeOrgLine={welcomeOrgLine}
        />
      ))}
    </>
  );
}

function DashboardWidget({
  id,
  role,
  welcomeName,
  welcomeOrgLine,
}: {
  id: DashboardWidgetId;
  role: UserRole;
  welcomeName: string;
  welcomeOrgLine?: string | null;
}) {
  switch (id) {
    case 'bulletins':
      return (
        <DashboardBulletinsBoard
          role={role}
          leading={
            <WorkbenchWelcomeBox
              displayName={welcomeName}
              orgLine={welcomeOrgLine}
              className="h-full"
            />
          }
        />
      );
    case 'learner_grades':
      return <DashboardLearnerGradesChart />;
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

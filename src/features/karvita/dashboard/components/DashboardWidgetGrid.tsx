'use client';

import { DashboardBulletinsBoard } from '@/features/karvita/bulletins/components/DashboardBulletinsBoard';
import type { UserRole } from '@/types/auth';

import {
  getDashboardWidgets,
  type DashboardWidgetId,
} from '../lib/dashboard-widgets';
import { DashboardLearnerDesk } from './DashboardLearnerDesk';
import { DashboardWelcomeBox } from './DashboardWelcomeBox';

type DashboardWidgetGridProps = {
  role: UserRole;
  welcomeName: string;
  welcomeSubtitle: string;
};

/**
 * سلول‌های ویجت میز کار برای قرار گرفتن داخل `WORKBENCH_GRID_CLASS`.
 * خودِ گرید بیرونی در `WorkbenchHomeClient` است تا میان‌برها هم همان ریتم را بگیرند.
 */
export function DashboardWidgetGrid({
  role,
  welcomeName,
  welcomeSubtitle,
}: DashboardWidgetGridProps) {
  return (
    <>
      {getDashboardWidgets(role).map((widget) => (
        <DashboardWidget
          key={widget.id}
          id={widget.id}
          role={role}
          welcomeName={welcomeName}
          welcomeSubtitle={welcomeSubtitle}
        />
      ))}
    </>
  );
}

function DashboardWidget({
  id,
  role,
  welcomeName,
  welcomeSubtitle,
}: {
  id: DashboardWidgetId;
  role: UserRole;
  welcomeName: string;
  welcomeSubtitle: string;
}) {
  switch (id) {
    case 'bulletins':
      return (
        <DashboardBulletinsBoard
          role={role}
          leading={
            <DashboardWelcomeBox
              displayName={welcomeName}
              subtitle={welcomeSubtitle}
              className="h-full"
            />
          }
        />
      );
    case 'learner_desk':
      return <DashboardLearnerDesk />;
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

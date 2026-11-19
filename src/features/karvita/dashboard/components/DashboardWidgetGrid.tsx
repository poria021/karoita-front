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
};

/**
 * ویجت‌های میز کار — فرزندان مستقیم شِل ۱۲ستونهٔ `WorkbenchHomeClient`.
 */
export function DashboardWidgetGrid({
  role,
  welcomeName,
}: DashboardWidgetGridProps) {
  return (
    <>
      {getDashboardWidgets(role).map((widget) => (
        <DashboardWidget
          key={widget.id}
          id={widget.id}
          role={role}
          welcomeName={welcomeName}
        />
      ))}
    </>
  );
}

function DashboardWidget({
  id,
  role,
  welcomeName,
}: {
  id: DashboardWidgetId;
  role: UserRole;
  welcomeName: string;
}) {
  switch (id) {
    case 'bulletins':
      return (
        <DashboardBulletinsBoard
          role={role}
          leading={
            <WorkbenchWelcomeBox displayName={welcomeName} className="h-full" />
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

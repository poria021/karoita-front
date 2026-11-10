'use client';

import type { CSSProperties, ReactNode } from 'react';

import { DashboardCourseMaterialsBox } from '@/features/karvita/course-materials/components/DashboardCourseMaterialsBox';
import { DashboardCapacityStatusBox } from '@/features/karvita/dashboard/components/DashboardCapacityStatusBox';
import { WorkbenchAdBox } from '@/features/karvita/dashboard/components/WorkbenchAdBox';
import {
  WorkbenchAnnouncementsBox,
  workbenchAnnouncementActionsFor,
} from '@/features/karvita/dashboard/components/WorkbenchAnnouncementsBox';
import { WorkbenchOnboardingApprovalsBox } from '@/features/karvita/dashboard/components/WorkbenchOnboardingApprovalsBox';
import { WorkbenchOrgStructureCountsBox } from '@/features/karvita/dashboard/components/WorkbenchOrgStructureCountsBox';
import { WorkbenchReportsMonitorBox } from '@/features/karvita/dashboard/components/WorkbenchReportsMonitorBox';
import { WorkbenchRoleUserCountsBox } from '@/features/karvita/dashboard/components/WorkbenchRoleUserCountsBox';
import { useDashboardCourseMaterials } from '@/features/karvita/dashboard/hooks/useDashboardCourseMaterials';
import {
  isEvaluationMonitorRole,
  type EvaluationMonitorRole,
} from '@/features/karvita/dashboard/lib/supervisor-reply-status';
import { cn } from '@/lib/utils';
import {
  WORKBENCH_SENIOR_BAND_CLASS,
  WORKBENCH_SENIOR_ONBOARDING_CLASS,
  WORKBENCH_SENIOR_ORG_STRUCTURE_CLASS,
  WORKBENCH_SENIOR_ORG_STRUCTURE_STACK_CLASS,
  WORKBENCH_SENIOR_ROLE_COUNTS_CLASS,
  workbenchAdCellClass,
  workbenchAllowsAdSpot,
  workbenchCellClass,
  workbenchCellStyle,
  workbenchLayoutForRole,
  workbenchLayoutKindFor,
  type WorkbenchBoxSlot,
} from '@/lib/workbench-grid';
import type { UserRole } from '@/types/auth';
import type { Bulletin } from '@/types/bulletins';

import { useDashboardBulletins } from '../hooks/useDashboardBulletins';

type DashboardBulletinsBoardProps = {
  role: UserRole;
  leading: ReactNode;
};

function hasAdSpot(role: UserRole, ads: readonly Bulletin[]): boolean {
  return workbenchAllowsAdSpot(role) && ads.length > 0;
}

/**
 * سلول‌های میز کار — فرزندان مستقیم شِل ۱۲ستونه.
 * محل از `workbenchLayoutForRole`؛ شکل لی‌اوت مثل قبل.
 */
export function DashboardBulletinsBoard({
  role,
  leading,
}: DashboardBulletinsBoardProps) {
  const data = useDashboardBulletins(role);
  const showAd = hasAdSpot(role, data.ads);
  const kind = workbenchLayoutKindFor(role);
  const showCapacity = role === 'supervisor_professor';
  const slots = workbenchLayoutForRole(role, { showAd, showCapacity });
  const actions = workbenchAnnouncementActionsFor(role);
  const announcementSource =
    kind === 'senior' ? 'received' : data.sources.announcement;

  return (
    <>
      {slots.map((slot) => (
        <WorkbenchBoardCell
          key={slot.id}
          slot={slot}
          role={role}
          leading={leading}
          announcements={data.announcements}
          ads={data.ads}
          isLoading={data.isLoading}
          isError={data.isError}
          announcementSource={announcementSource}
          canPublish={actions.canPublish}
          canReceive={actions.canReceive}
        />
      ))}
    </>
  );
}

function MaterialsCell({
  className,
  style,
}: {
  className: string;
  style?: CSSProperties;
}) {
  const materials = useDashboardCourseMaterials();
  return (
    <DashboardCourseMaterialsBox
      materials={materials.materials}
      materialsHrefByCourseKey={materials.materialsHrefByCourseKey}
      isLoading={materials.isLoading}
      className={className}
      style={style}
    />
  );
}

function SeniorBand({ className }: { className: string }) {
  return (
    <div className={cn(className, WORKBENCH_SENIOR_BAND_CLASS)}>
      <WorkbenchOnboardingApprovalsBox
        className={cn(WORKBENCH_SENIOR_ONBOARDING_CLASS, 'min-w-0')}
      />
      <div className={WORKBENCH_SENIOR_ORG_STRUCTURE_STACK_CLASS}>
        <WorkbenchOrgStructureCountsBox
          className={cn(WORKBENCH_SENIOR_ORG_STRUCTURE_CLASS, 'min-w-0')}
        />
        <WorkbenchRoleUserCountsBox
          className={WORKBENCH_SENIOR_ROLE_COUNTS_CLASS}
        />
      </div>
    </div>
  );
}

function WorkbenchBoardCell({
  slot,
  role,
  leading,
  announcements,
  ads,
  isLoading,
  isError,
  announcementSource,
  canPublish,
  canReceive,
}: {
  slot: WorkbenchBoxSlot;
  role: UserRole;
  leading: ReactNode;
  announcements: Bulletin[];
  ads: Bulletin[];
  isLoading: boolean;
  isError: boolean;
  announcementSource: 'received' | 'published';
  canPublish: boolean;
  canReceive: boolean;
}) {
  const { id, placement } = slot;
  const cellClass =
    id === 'ad' ? workbenchAdCellClass(placement) : workbenchCellClass(placement);
  const cellStyle = workbenchCellStyle(placement);

  switch (id) {
    case 'welcome':
      return (
        <div className={cellClass} style={cellStyle}>
          {leading}
        </div>
      );
    case 'announcements':
      return (
        <WorkbenchAnnouncementsBox
          announcements={announcements}
          isLoading={isLoading}
          isError={isError}
          source={announcementSource}
          canPublish={canPublish}
          canReceive={canReceive}
          className={cn(cellClass, 'overflow-hidden')}
          style={cellStyle}
        />
      );
    case 'ad':
      return (
        <div className={cellClass} style={cellStyle}>
          <WorkbenchAdBox ads={ads} />
        </div>
      );
    case 'materials':
      return <MaterialsCell className={cellClass} style={cellStyle} />;
    case 'senior_band':
      return <SeniorBand className={cellClass} />;
    case 'monitor':
      if (!isEvaluationMonitorRole(role)) return null;
      return (
        <div className={cn(cellClass, 'overflow-hidden')}>
          <WorkbenchReportsMonitorBox
            role={role as EvaluationMonitorRole}
            className="h-full min-h-0 w-full min-w-0 max-w-full overflow-hidden"
            style={cellStyle}
          />
        </div>
      );
    case 'capacity':
      return (
        <div className={cn(cellClass, 'overflow-hidden')}>
          <DashboardCapacityStatusBox
            className="min-h-0 min-w-0 w-full"
            style={cellStyle}
          />
        </div>
      );
    case 'checklist':
    case 'learner_grades':
      return null;
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

export function workbenchBoardShowsAd(
  role: UserRole,
  ads: readonly Bulletin[]
): boolean {
  return hasAdSpot(role, ads);
}

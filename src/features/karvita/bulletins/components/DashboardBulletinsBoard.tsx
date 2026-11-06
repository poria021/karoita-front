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
import { useDashboardCourseMaterials } from '@/features/karvita/dashboard/hooks/useDashboardCourseMaterials';
import {
  isEvaluationMonitorRole,
  type EvaluationMonitorRole,
} from '@/features/karvita/dashboard/lib/supervisor-reply-status';
import { cn } from '@/lib/utils';
import {
  WORKBENCH_AD_SPAN,
  WORKBENCH_ANNOUNCEMENTS_SPAN,
  WORKBENCH_CLASSIC_TOP_GRID_CLASS,
  WORKBENCH_CLASSIC_TOP_GRID_NO_AD_CLASS,
  WORKBENCH_EVAL_AD_CELL,
  WORKBENCH_EVAL_ANNOUNCEMENTS_CELL,
  WORKBENCH_EVAL_CAPACITY_CELL,
  WORKBENCH_EVAL_MONITOR_BESIDE_CELL,
  WORKBENCH_EVAL_WELCOME_CELL,
  WORKBENCH_EVALUATION_TOP_GRID_CLASS,
  WORKBENCH_EVALUATION_TOP_GRID_NO_AD_CLASS,
  WORKBENCH_FULL_SPAN,
  WORKBENCH_LEARNER_ANNOUNCEMENTS_STYLE,
  WORKBENCH_LEARNER_INBOX_ROW_CLASS,
  WORKBENCH_LEARNER_STACK_CLASS,
  WORKBENCH_LEARNER_TOP_GRID_CLASS,
  WORKBENCH_LEARNER_TOP_GRID_NO_AD_CLASS,
  WORKBENCH_LEARNER_WELCOME_STYLE,
  WORKBENCH_MONITOR_PANEL_STYLE,
  WORKBENCH_SENIOR_ADMIN_ROW_CLASS,
  WORKBENCH_SENIOR_ONBOARDING_CLASS,
  WORKBENCH_SENIOR_ORG_STRUCTURE_CLASS,
  WORKBENCH_SIDE_PANEL_STYLE,
  WORKBENCH_WELCOME_SPAN,
} from '@/lib/workbench-grid';
import type { DashboardBulletinSource } from '@/services/bulletins/bulletin-rules';
import type { UserRole } from '@/types/auth';
import type { Bulletin } from '@/types/bulletins';

import { useDashboardBulletins } from '../hooks/useDashboardBulletins';

type DashboardBulletinsBoardProps = {
  role: UserRole;
  /** ستون راست (اول در RTL) — معمولاً باکس خوش‌آمد / خلاصه وضعیت. */
  leading: ReactNode;
};

/** خوش‌آمد کوتاه + اطلاعیه زیر آن | تبلیغ کناری — مثل میز کار فراگیر. */
function usesStackedWorkbenchLayout(role: UserRole): boolean {
  return (
    role === 'student' ||
    role === 'skill_learner' ||
    role === 'supervisor_professor' ||
    role === 'mentor_teacher' ||
    role === 'school_principal' ||
    role === 'super_admin' ||
    role === 'assistant_admin'
  );
}

/** فقط فراگیر: اطلاعیه و جزوه کنار هم زیر خوش‌آمد. */
function usesLearnerInboxRow(role: UserRole): boolean {
  return role === 'student' || role === 'skill_learner';
}

/** مدیر ارشد / دستیار: زیر خوش‌آمد — پرونده‌ها | ساختار (گرید جدا). */
function usesSeniorAdminWorkbenchRow(role: UserRole): boolean {
  return role === 'super_admin' || role === 'assistant_admin';
}

/** استاد / معلم راهنما / مدیر: گرید تخت با سلول مانیتورینگ. */
function usesEvaluationGrid(role: UserRole): boolean {
  return isEvaluationMonitorRole(role);
}

/** فقط استاد راهنما: سلول ظرفیت کنار اطلاعیه. */
function usesSupervisorCapacity(role: UserRole): boolean {
  return role === 'supervisor_professor';
}

/** مدیر ارشد تبلیغ روی میز کار نمی‌بیند (مدیریت از هاب اطلاعیه‌هاست). */
function usesWorkbenchAdSpot(role: UserRole): boolean {
  return role !== 'super_admin';
}

/**
 * Spot تبلیغ: فقط وقتی نقش آن را دارد و حداقل یک تبلیغ فعال هست.
 * وگرنه ستون حذف می‌شود و بقیهٔ سلول‌ها جای خالی را پر می‌کنند.
 */
function hasAdSpot(role: UserRole, ads: readonly Bulletin[]): boolean {
  return usesWorkbenchAdSpot(role) && ads.length > 0;
}

type InboxProps = {
  role: UserRole;
  announcements: Bulletin[];
  isLoading: boolean;
  isError: boolean;
  source: DashboardBulletinSource;
  className: string;
  style: CSSProperties;
};

/** باکس اطلاعیهٔ مشترک همهٔ نقش‌های میز کار — اکشن‌ها از نقش مشتق می‌شوند. */
function AnnouncementsCell(props: InboxProps) {
  const actions = workbenchAnnouncementActionsFor(props.role);
  return (
    <WorkbenchAnnouncementsBox
      announcements={props.announcements}
      isLoading={props.isLoading}
      isError={props.isError}
      source={props.source}
      canPublish={actions.canPublish}
      canReceive={actions.canReceive}
      className={props.className}
      style={props.style}
    />
  );
}

/** فراگیر: اطلاعیه و جزوه دو باکس جدا کنار هم. */
function LearnerInboxRow(props: InboxProps) {
  const materials = useDashboardCourseMaterials();
  return (
    <div className={WORKBENCH_LEARNER_INBOX_ROW_CLASS}>
      <AnnouncementsCell {...props} />
      <DashboardCourseMaterialsBox
        materials={materials.materials}
        materialsHrefByCourseKey={materials.materialsHrefByCourseKey}
        isLoading={materials.isLoading}
        className={props.className}
        style={props.style}
      />
    </div>
  );
}

/** ردیف پرونده‌ها | ساختار — مستقل از عرض خوش‌آمد. */
function SeniorAdminWorkbenchRow({
  className,
}: Pick<InboxProps, 'className'>) {
  return (
    <div className={WORKBENCH_SENIOR_ADMIN_ROW_CLASS}>
      <WorkbenchOnboardingApprovalsBox
        className={cn(className, WORKBENCH_SENIOR_ONBOARDING_CLASS, 'min-w-0')}
      />
      <WorkbenchOrgStructureCountsBox
        className={cn(
          className,
          WORKBENCH_SENIOR_ORG_STRUCTURE_CLASS,
          'min-w-0 w-full'
        )}
      />
    </div>
  );
}

/**
 * استاد / معلم / مدیر — لی‌اوت یکسان:
 * خوش‌آمد تمام‌عرض | تبلیغ
 * اطلاعیه (۲) | مانیتورینگ (۲)
 * ظرفیت فقط برای استاد راهنما زیر اطلاعیه.
 */
function EvaluationWorkbenchGrid({
  role,
  leading,
  inboxProps,
  showCapacity,
  showAd,
  ad,
}: {
  role: EvaluationMonitorRole;
  leading: ReactNode;
  inboxProps: InboxProps;
  showCapacity: boolean;
  showAd: boolean;
  ad: ReactNode;
}) {
  return (
    <div
      className={cn(
        WORKBENCH_FULL_SPAN,
        showAd
          ? WORKBENCH_EVALUATION_TOP_GRID_CLASS
          : WORKBENCH_EVALUATION_TOP_GRID_NO_AD_CLASS
      )}
    >
      <div
        className={WORKBENCH_EVAL_WELCOME_CELL}
        style={WORKBENCH_LEARNER_WELCOME_STYLE}
      >
        {leading}
      </div>

      {showAd ? <div className={WORKBENCH_EVAL_AD_CELL}>{ad}</div> : null}

      <div className={WORKBENCH_EVAL_ANNOUNCEMENTS_CELL}>
        <AnnouncementsCell {...inboxProps} />
      </div>

      <div className={WORKBENCH_EVAL_MONITOR_BESIDE_CELL}>
        <WorkbenchReportsMonitorBox
          role={role}
          className="h-full min-h-0 w-full min-w-0 max-w-full overflow-hidden"
          style={inboxProps.style}
        />
      </div>

      {showCapacity ? (
        <div className={WORKBENCH_EVAL_CAPACITY_CELL}>
          <DashboardCapacityStatusBox
            className={WORKBENCH_ANNOUNCEMENTS_SPAN}
            style={WORKBENCH_MONITOR_PANEL_STYLE}
          />
        </div>
      ) : null}
    </div>
  );
}

/**
 * سلول‌های ردیف بالای میز کار داخل گرید والد.
 * Spot تبلیغ اختیاری است — بدون تبلیغ، بقیهٔ باکس‌ها جای خالی را می‌گیرند.
 */
export function DashboardBulletinsBoard({
  role,
  leading,
}: DashboardBulletinsBoardProps) {
  const data = useDashboardBulletins(role);
  const stackedLayout = usesStackedWorkbenchLayout(role);
  const learnerInbox = usesLearnerInboxRow(role);
  const evaluationGrid = usesEvaluationGrid(role);
  const showCapacity = usesSupervisorCapacity(role);
  const showAd = hasAdSpot(role, data.ads);
  const announcementsStyle = stackedLayout
    ? WORKBENCH_LEARNER_ANNOUNCEMENTS_STYLE
    : WORKBENCH_SIDE_PANEL_STYLE;

  const inboxProps: InboxProps = {
    role,
    announcements: data.announcements,
    isLoading: data.isLoading,
    isError: data.isError,
    source: data.sources.announcement,
    className: WORKBENCH_ANNOUNCEMENTS_SPAN,
    style: announcementsStyle,
  };

  const adBox = showAd ? <WorkbenchAdBox ads={data.ads} /> : null;

  if (evaluationGrid) {
    return (
      <EvaluationWorkbenchGrid
        role={role as EvaluationMonitorRole}
        leading={leading}
        inboxProps={inboxProps}
        showCapacity={showCapacity}
        showAd={showAd}
        ad={adBox}
      />
    );
  }

  const announcements = learnerInbox ? (
    <LearnerInboxRow {...inboxProps} />
  ) : usesSeniorAdminWorkbenchRow(role) ? (
    <SeniorAdminWorkbenchRow className={inboxProps.className} />
  ) : (
    <AnnouncementsCell {...inboxProps} />
  );

  if (stackedLayout) {
    return (
      <div
        className={cn(
          WORKBENCH_FULL_SPAN,
          showAd
            ? WORKBENCH_LEARNER_TOP_GRID_CLASS
            : WORKBENCH_LEARNER_TOP_GRID_NO_AD_CLASS
        )}
      >
        <div className={WORKBENCH_LEARNER_STACK_CLASS}>
          <div
            className={WORKBENCH_WELCOME_SPAN}
            style={WORKBENCH_LEARNER_WELCOME_STYLE}
          >
            {leading}
          </div>
          {announcements}
        </div>
        {showAd ? <div className={WORKBENCH_AD_SPAN}>{adBox}</div> : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        WORKBENCH_FULL_SPAN,
        showAd
          ? WORKBENCH_CLASSIC_TOP_GRID_CLASS
          : WORKBENCH_CLASSIC_TOP_GRID_NO_AD_CLASS
      )}
    >
      <div className={WORKBENCH_WELCOME_SPAN} style={WORKBENCH_SIDE_PANEL_STYLE}>
        {leading}
      </div>
      {announcements}
      {showAd ? <div className={WORKBENCH_AD_SPAN}>{adBox}</div> : null}
    </div>
  );
}

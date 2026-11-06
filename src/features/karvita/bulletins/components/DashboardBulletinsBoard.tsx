'use client';

import type { CSSProperties, ReactNode } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { DashboardCourseMaterialsBox } from '@/features/karvita/course-materials/components/DashboardCourseMaterialsBox';
import { DashboardCapacityStatusBox } from '@/features/karvita/dashboard/components/DashboardCapacityStatusBox';
import { DashboardSupervisorReplyStatusBox } from '@/features/karvita/dashboard/components/DashboardSupervisorReplyStatusBox';
import { useDashboardCourseMaterials } from '@/features/karvita/dashboard/hooks/useDashboardCourseMaterials';
import {
  isEvaluationMonitorRole,
  type EvaluationMonitorRole,
} from '@/features/karvita/dashboard/lib/supervisor-reply-status';
import { cn } from '@/lib/utils';
import {
  WORKBENCH_AD_SPAN,
  WORKBENCH_ANNOUNCEMENTS_SPAN,
  WORKBENCH_EVAL_AD_CELL,
  WORKBENCH_EVAL_ANNOUNCEMENTS_CELL,
  WORKBENCH_EVAL_ANNOUNCEMENTS_WIDE_CELL,
  WORKBENCH_EVAL_CAPACITY_CELL,
  WORKBENCH_EVAL_MONITOR_BESIDE_CELL,
  WORKBENCH_EVAL_MONITOR_WIDE_PARENT_CELL,
  WORKBENCH_EVAL_WELCOME_CELL,
  WORKBENCH_EVALUATION_TOP_GRID_CLASS,
  WORKBENCH_FULL_SPAN,
  WORKBENCH_LEARNER_ANNOUNCEMENTS_STYLE,
  WORKBENCH_LEARNER_INBOX_ROW_CLASS,
  WORKBENCH_LEARNER_STACK_CLASS,
  WORKBENCH_LEARNER_TOP_GRID_CLASS,
  WORKBENCH_LEARNER_WELCOME_STYLE,
  WORKBENCH_MONITOR_PANEL_STYLE,
  WORKBENCH_SIDE_PANEL_STYLE,
  WORKBENCH_WELCOME_SPAN,
} from '@/lib/workbench-grid';
import {
  canPublishAnnouncements,
  canReceiveBulletins,
  type DashboardBulletinSource,
} from '@/services/bulletins/bulletin-rules';
import type { UserRole } from '@/types/auth';
import type { Bulletin } from '@/types/bulletins';

import { useDashboardBulletins } from '../hooks/useDashboardBulletins';
import { DashboardAdBox } from './DashboardAdBox';
import { DashboardAnnouncementsBox } from './DashboardAnnouncementsBox';

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
    role === 'school_principal'
  );
}

/** فقط فراگیر: اطلاعیه و جزوه کنار هم زیر خوش‌آمد. */
function usesLearnerInboxRow(role: UserRole): boolean {
  return role === 'student' || role === 'skill_learner';
}

/** استاد / معلم راهنما / مدیر: گرید تخت با سلول مانیتورینگ. */
function usesEvaluationGrid(role: UserRole): boolean {
  return isEvaluationMonitorRole(role);
}

/** فقط استاد راهنما: سلول ظرفیت کنار اطلاعیه. */
function usesSupervisorCapacity(role: UserRole): boolean {
  return role === 'supervisor_professor';
}

type InboxProps = {
  role: UserRole;
  announcements: Bulletin[];
  isLoading: boolean;
  source: DashboardBulletinSource;
  className: string;
  style: CSSProperties;
};

function AnnouncementsCell(props: InboxProps) {
  return (
    <DashboardAnnouncementsBox
      announcements={props.announcements}
      isLoading={props.isLoading}
      source={props.source}
      canPublish={canPublishAnnouncements(props.role)}
      canReceive={canReceiveBulletins(props.role)}
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

/**
 * استاد / معلم / مدیر: هر باکس یک سلول گرید.
 * کنار اطلاعیه → مانیتورینگ؛ زیر اطلاعیه → ظرفیت (نصف عرض).
 */
function EvaluationWorkbenchGrid({
  role,
  leading,
  inboxProps,
  showCapacity,
  ad,
}: {
  role: EvaluationMonitorRole;
  leading: ReactNode;
  inboxProps: InboxProps;
  showCapacity: boolean;
  ad: ReactNode;
}) {
  return (
    <div className={cn(WORKBENCH_FULL_SPAN, WORKBENCH_EVALUATION_TOP_GRID_CLASS)}>
      <div
        className={WORKBENCH_EVAL_WELCOME_CELL}
        style={WORKBENCH_LEARNER_WELCOME_STYLE}
      >
        {leading}
      </div>

      <div className={WORKBENCH_EVAL_AD_CELL}>{ad}</div>

      <div
        className={
          showCapacity
            ? WORKBENCH_EVAL_ANNOUNCEMENTS_CELL
            : WORKBENCH_EVAL_ANNOUNCEMENTS_WIDE_CELL
        }
      >
        <AnnouncementsCell {...inboxProps} />
      </div>

      <div
        className={
          showCapacity
            ? WORKBENCH_EVAL_MONITOR_BESIDE_CELL
            : WORKBENCH_EVAL_MONITOR_WIDE_PARENT_CELL
        }
      >
        <DashboardSupervisorReplyStatusBox
          role={role}
          className="h-full min-h-0 w-full min-w-0 max-w-full overflow-hidden"
          style={
            showCapacity ? inboxProps.style : WORKBENCH_MONITOR_PANEL_STYLE
          }
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
 * فراگیر: خوش‌آمد کوتاه + اطلاعیه|جزوه | تبلیغ.
 * استاد/معلم/مدیر: گرید تخت هر باکس یک سلول.
 * بقیهٔ نقش‌ها: خوش‌آمد | اطلاعیه | تبلیغ در سه ستون.
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
  const announcementsStyle = stackedLayout
    ? WORKBENCH_LEARNER_ANNOUNCEMENTS_STYLE
    : WORKBENCH_SIDE_PANEL_STYLE;

  const inboxProps: InboxProps = {
    role,
    announcements: data.isError ? [] : data.announcements,
    isLoading: !data.isError && data.isLoading,
    source: data.sources.announcement,
    className: WORKBENCH_ANNOUNCEMENTS_SPAN,
    style: announcementsStyle,
  };

  const adBox = (
    <DashboardAdBox
      ads={data.isError ? [] : data.ads}
      isLoading={!data.isError && data.isLoading}
      isPublisher={data.sources.advertisement === 'published'}
    />
  );

  if (evaluationGrid) {
    return (
      <EvaluationWorkbenchGrid
        role={role as EvaluationMonitorRole}
        leading={leading}
        inboxProps={inboxProps}
        showCapacity={showCapacity}
        ad={adBox}
      />
    );
  }

  const announcements =
    data.isError && !stackedLayout ? (
      <section
        aria-label="اطلاعیه‌ها"
        style={announcementsStyle}
        className={cn(
          WORKBENCH_ANNOUNCEMENTS_SPAN,
          'flex flex-col justify-center overflow-hidden rounded-kv-shell border border-kv-border/70 bg-kv-surface p-kv-group shadow-kv-soft'
        )}
      >
        <KvTypography variant="body" tone="muted" as="p">
          اطلاعیه‌ها و تبلیغات فعلاً در دسترس نیست؛ کمی بعد دوباره تلاش کنید.
        </KvTypography>
      </section>
    ) : learnerInbox ? (
      <LearnerInboxRow {...inboxProps} />
    ) : (
      <AnnouncementsCell {...inboxProps} />
    );

  const ad = <div className={WORKBENCH_AD_SPAN}>{adBox}</div>;

  if (stackedLayout) {
    return (
      <div className={cn(WORKBENCH_FULL_SPAN, WORKBENCH_LEARNER_TOP_GRID_CLASS)}>
        <div className={WORKBENCH_LEARNER_STACK_CLASS}>
          <div
            className={WORKBENCH_WELCOME_SPAN}
            style={WORKBENCH_LEARNER_WELCOME_STYLE}
          >
            {leading}
          </div>
          {announcements}
        </div>
        {ad}
      </div>
    );
  }

  return (
    <>
      <div className={WORKBENCH_WELCOME_SPAN} style={WORKBENCH_SIDE_PANEL_STYLE}>
        {leading}
      </div>
      {announcements}
      {ad}
    </>
  );
}

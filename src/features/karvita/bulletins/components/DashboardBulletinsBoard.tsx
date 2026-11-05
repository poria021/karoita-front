'use client';

import type { ReactNode } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import {
  WORKBENCH_AD_SPAN,
  WORKBENCH_ANNOUNCEMENTS_SPAN,
  WORKBENCH_FULL_SPAN,
  WORKBENCH_LEARNER_ANNOUNCEMENTS_STYLE,
  WORKBENCH_LEARNER_STACK_CLASS,
  WORKBENCH_LEARNER_TOP_GRID_CLASS,
  WORKBENCH_LEARNER_WELCOME_STYLE,
  WORKBENCH_SIDE_PANEL_STYLE,
  WORKBENCH_WELCOME_SPAN,
} from '@/lib/workbench-grid';
import { cn } from '@/lib/utils';
import {
  canPublishAnnouncements,
  canReceiveBulletins,
} from '@/services/bulletins/bulletin-rules';
import type { UserRole } from '@/types/auth';

import { useDashboardBulletins } from '../hooks/useDashboardBulletins';
import { DashboardAdBox } from './DashboardAdBox';
import { DashboardAnnouncementsBox } from './DashboardAnnouncementsBox';

type DashboardBulletinsBoardProps = {
  role: UserRole;
  /** ستون راست (اول در RTL) — معمولاً باکس خوش‌آمد / خلاصه وضعیت. */
  leading: ReactNode;
};

function usesLearnerWorkbenchLayout(role: UserRole): boolean {
  return role === 'student' || role === 'skill_learner';
}

/**
 * سلول‌های ردیف بالای میز کار داخل گرید والد.
 * دانشجو/مهارت‌آموز: خوش‌آمد + اطلاعیه (= ارتفاع تبلیغ) | تبلیغ چپ.
 */
export function DashboardBulletinsBoard({
  role,
  leading,
}: DashboardBulletinsBoardProps) {
  const data = useDashboardBulletins(role);
  const learnerLayout = usesLearnerWorkbenchLayout(role);
  const announcementsStyle = learnerLayout
    ? WORKBENCH_LEARNER_ANNOUNCEMENTS_STYLE
    : WORKBENCH_SIDE_PANEL_STYLE;

  const announcements = data.isError ? (
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
  ) : (
    <DashboardAnnouncementsBox
      announcements={data.announcements}
      isLoading={data.isLoading}
      source={data.sources.announcement}
      canPublish={canPublishAnnouncements(role)}
      canReceive={canReceiveBulletins(role)}
      className={WORKBENCH_ANNOUNCEMENTS_SPAN}
      style={announcementsStyle}
    />
  );
  const ad = (
    <div className={WORKBENCH_AD_SPAN}>
      <DashboardAdBox
        ads={data.isError ? [] : data.ads}
        isLoading={!data.isError && data.isLoading}
        isPublisher={data.sources.advertisement === 'published'}
      />
    </div>
  );

  if (learnerLayout) {
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
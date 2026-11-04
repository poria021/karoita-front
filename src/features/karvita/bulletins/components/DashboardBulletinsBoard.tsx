'use client';

import type { ReactNode } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import {
  WORKBENCH_AD_SPAN,
  WORKBENCH_ANNOUNCEMENTS_SPAN,
  WORKBENCH_SIDE_PANEL_STYLE,
  WORKBENCH_WELCOME_SPAN,
} from '@/lib/workbench-grid';
import { cn } from '@/lib/utils';
import { canPublishAnnouncements } from '@/services/bulletins/bulletin-rules';
import type { UserRole } from '@/types/auth';

import { useDashboardBulletins } from '../hooks/useDashboardBulletins';
import { DashboardAdBox } from './DashboardAdBox';
import { DashboardAnnouncementsBox } from './DashboardAnnouncementsBox';

type DashboardBulletinsBoardProps = {
  role: UserRole;
  /** ستون راست (اول در RTL) — معمولاً باکس خوش‌آمد. */
  leading: ReactNode;
};

/**
 * سلول‌های ردیف بالای میز کار داخل گرید والد (`WorkbenchHomeClient`):
 * leading (راست) → اطلاعیه‌ها (وسط) → تبلیغ سایدبار (چپ).
 * خوش‌آمد و اطلاعیه‌ها ارتفاع ثابت مشترک دارند (کوتاه‌تر از تبلیغ).
 */
export function DashboardBulletinsBoard({
  role,
  leading,
}: DashboardBulletinsBoardProps) {
  const data = useDashboardBulletins(role);

  const announcements = data.isError ? (
    <section
      aria-label="اطلاعیه‌ها"
      style={WORKBENCH_SIDE_PANEL_STYLE}
      className={cn(
        WORKBENCH_ANNOUNCEMENTS_SPAN,
        'flex flex-col justify-center overflow-hidden rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group shadow-kv-raised'
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
      className={WORKBENCH_ANNOUNCEMENTS_SPAN}
      style={WORKBENCH_SIDE_PANEL_STYLE}
    />
  );

  return (
    <>
      <div className={WORKBENCH_WELCOME_SPAN} style={WORKBENCH_SIDE_PANEL_STYLE}>
        {leading}
      </div>
      {announcements}
      <div className={WORKBENCH_AD_SPAN}>
        <DashboardAdBox
          ads={data.isError ? [] : data.ads}
          isLoading={!data.isError && data.isLoading}
          isPublisher={data.sources.advertisement === 'published'}
        />
      </div>
    </>
  );
}

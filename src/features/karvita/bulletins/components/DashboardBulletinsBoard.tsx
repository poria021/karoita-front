'use client';

import { KvTypography } from '@/components/shared/KvTypography';
import { canPublishAnnouncements } from '@/services/bulletins/bulletin-rules';
import type { UserRole } from '@/types/auth';

import { useDashboardBulletins } from '../hooks/useDashboardBulletins';
import { DashboardAdBox } from './DashboardAdBox';
import { DashboardAnnouncementsBox } from './DashboardAnnouncementsBox';

/**
 * ردیف بالای میز کار همهٔ پنل‌ها: باکس ۱×۱ تبلیغ ستاد + باکس اطلاعیه‌ها.
 * از md به بالا ارتفاع ردیف را مربع تبلیغ تعیین می‌کند و لیست اطلاعیه داخل آن اسکرول می‌خورد.
 * real mode روی سرور جعلی (`pnpm fake-api`) کامل کار می‌کند؛ اگر endpoint در بک‌اند زنده
 * هنوز نباشد، به‌جای پنهان‌شدن بی‌صدای ردیف یک پیام ملایم نشان داده می‌شود.
 */
export function DashboardBulletinsBoard({ role }: { role: UserRole }) {
  const data = useDashboardBulletins(role);
  if (data.isError) {
    return (
      <section
        aria-label="اطلاعیه‌ها و تبلیغات"
        className="rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group shadow-kv-raised"
      >
        <KvTypography variant="body" tone="muted" as="p">
          اطلاعیه‌ها و تبلیغات فعلاً در دسترس نیست؛ کمی بعد دوباره تلاش کنید.
        </KvTypography>
      </section>
    );
  }

  return (
    <div className="grid gap-kv-group md:grid-cols-2 lg:grid-cols-3">
      <div className="w-full max-w-md justify-self-center md:max-w-none">
        <DashboardAdBox
          ads={data.ads}
          isLoading={data.isLoading}
          isPublisher={data.sources.advertisement === 'published'}
        />
      </div>
      <DashboardAnnouncementsBox
        announcements={data.announcements}
        isLoading={data.isLoading}
        source={data.sources.announcement}
        canPublish={canPublishAnnouncements(role)}
        className="max-h-[28rem] md:h-0 md:max-h-none md:min-h-full lg:col-span-2"
      />
    </div>
  );
}

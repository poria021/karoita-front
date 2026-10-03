'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { canReceiveBulletins } from '@/services/bulletins/bulletin-rules';
import { BulletinsService } from '@/services/bulletins.service';
import type { UserRole } from '@/types/auth';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { BulletinCard } from './BulletinCard';

/**
 * تبلیغات ستاد و باکس «اطلاعیه‌ها» در میز کار — فقط برای نقش‌هایی که پنل بالادست دارند.
 * real mode تا آمدن endpoint خطا می‌دهد؛ آن وقت باکس بی‌صدا پنهان می‌ماند.
 */
export function DashboardBulletinsBoard({ role }: { role: UserRole }) {
  const enabled = canReceiveBulletins(role);
  const query = useQuery({
    queryKey: [...DASHBOARD_QUERY.bulletinsDashboard, role],
    queryFn: () => BulletinsService.listDashboardBulletins(),
    staleTime: QUERY_STALE_MS.list,
    retry: false,
    enabled,
  });

  const { ads, announcements } = useMemo(() => {
    const rows = query.data ?? [];
    return {
      ads: rows.filter((row) => row.kind === 'advertisement'),
      announcements: rows.filter((row) => row.kind === 'announcement'),
    };
  }, [query.data]);

  if (!enabled || query.isError) return null;

  return (
    <div className="flex flex-col gap-kv-section">
      {ads.length > 0 ? (
        <section aria-label="تبلیغات" className="grid gap-kv-pair lg:grid-cols-2">
          {ads.map((ad) => (
            <BulletinCard key={ad.id} bulletin={ad} />
          ))}
        </section>
      ) : null}

      <section
        aria-labelledby="dashboard-announcements-title"
        className="flex flex-col gap-kv-group rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group shadow-kv-raised"
      >
        <header className="flex items-center gap-kv-inline">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand">
            <FaIcon icon={faIcons.bell} size="sm" />
          </span>
          <KvTypography variant="subtitle" as="h3" id="dashboard-announcements-title">
            اطلاعیه‌ها
          </KvTypography>
          {announcements.length > 0 ? (
            <KvTypography variant="caption" tone="muted" as="span">
              ({toPersianDigits(String(announcements.length))})
            </KvTypography>
          ) : null}
        </header>

        {query.isLoading ? (
          <KvTypography variant="caption" tone="muted" as="p">
            در حال بارگذاری اطلاعیه‌ها…
          </KvTypography>
        ) : announcements.length === 0 ? (
          <KvTypography variant="body" tone="muted" as="p">
            فعلاً اطلاعیه‌ای برای شما منتشر نشده است.
          </KvTypography>
        ) : (
          <ul className="flex max-h-[28rem] list-none flex-col gap-kv-pair overflow-y-auto">
            {announcements.map((item) => (
              <li key={item.id}>
                <BulletinCard bulletin={item} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

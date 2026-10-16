'use client';

import { useQuery } from '@tanstack/react-query';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { dashboardBulletinSources } from '@/services/bulletins/bulletin-rules';
import { BulletinsService } from '@/services/bulletins.service';
import type { UserRole } from '@/types/auth';
import type { Bulletin, BulletinKind } from '@/types/bulletins';

/**
 * دادهٔ باکس تبلیغ و اطلاعیهٔ میز کار. منبع هر باکس از `dashboardBulletinSources`؛
 * کلید «منتشرشده» همان کلید صفحهٔ مدیریت است تا کش مشترک باشد.
 */
export function useDashboardBulletins(role: UserRole) {
  const sources = dashboardBulletinSources(role);
  const needs = (source: 'received' | 'published') =>
    sources.advertisement === source || sources.announcement === source;

  const received = useQuery({
    queryKey: [...DASHBOARD_QUERY.bulletinsDashboard, role],
    queryFn: () => BulletinsService.listDashboardBulletins(),
    staleTime: QUERY_STALE_MS.list,
    retry: false,
    enabled: needs('received'),
  });
  const published = useQuery({
    queryKey: [...DASHBOARD_QUERY.bulletinsManaged, role],
    queryFn: () => BulletinsService.listManagedBulletins(),
    staleTime: QUERY_STALE_MS.list,
    retry: false,
    enabled: needs('published'),
  });

  const rowsFor = (kind: BulletinKind): Bulletin[] => {
    const query = sources[kind] === 'received' ? received : published;
    return (query.data ?? []).filter((row) => row.kind === kind);
  };

  return {
    ads: rowsFor('advertisement'),
    announcements: rowsFor('announcement'),
    sources,
    isLoading: received.isLoading || published.isLoading,
    /** real mode تا آمدن endpoint خطا می‌دهد؛ آن وقت باکس‌ها بی‌صدا پنهان می‌مانند. */
    isError: received.isError || published.isError,
  };
}

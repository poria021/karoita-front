'use client';

import { useQuery } from '@tanstack/react-query';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { usersApi } from '@/services/users/users.api';
import type { NestDashboardCountsDto } from '@/types/nest-users';

/**
 * `GET /api/v1/users/dashboard/counts` — فقط ادمین/سوپرادمین.
 * یک کوئری مشترک برای باکس‌های «ساختار سازمانی» و «کاربران هر نقش» میز کار؛
 * هر باکس با `select` سهم خودش را برمی‌دارد.
 */
export function useDashboardCountsQuery<T>(
  select: (dto: NestDashboardCountsDto) => T,
  enabled = true
) {
  return useQuery({
    queryKey: DASHBOARD_QUERY.usersDashboardCounts,
    queryFn: () => usersApi.dashboardCounts(),
    staleTime: QUERY_STALE_MS.module,
    select,
    enabled,
  });
}

'use client';

import { useMemo } from 'react';

import {
  buildRoleUserCountMetrics,
  FAKE_ROLE_USER_COUNTS,
  sumRoleUserCounts,
  type RoleUserCountMetric,
} from '../lib/role-user-counts';

export type DashboardRoleUserCountsState = {
  isLoading: boolean;
  isError: boolean;
  metrics: RoleUserCountMetric[];
  total: number;
};

/**
 * شمار کاربران هر نقش برای میز کار مدیر ارشد.
 * فعلاً دادهٔ فیک؛ بعد از آماده‌شدن بک‌اند به `loadRoleUserCounts` وصل می‌شود.
 */
export function useDashboardRoleUserCounts(): DashboardRoleUserCountsState {
  const metrics = useMemo(
    () => buildRoleUserCountMetrics(FAKE_ROLE_USER_COUNTS),
    []
  );

  return {
    isLoading: false,
    isError: false,
    metrics,
    total: sumRoleUserCounts(metrics),
  };
}

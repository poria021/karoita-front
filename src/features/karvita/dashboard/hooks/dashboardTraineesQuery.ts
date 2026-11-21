import { queryOptions } from '@tanstack/react-query';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import type { UserRole } from '@/types/auth';

import { loadDashboardTrainees } from '../lib/load-dashboard-trainees';

/**
 * `GET mentor/students` (+ ترم‌های ارزیابی) فقط برای نقش‌های ارزیابی مجاز است.
 * میز کار منطقه/دانشکده/استان همان کارت «نمره …» را نشان می‌دهد ولی نباید این
 * endpointها را بزند (۴۰۳).
 */
export function canLoadDashboardTrainees(role: UserRole): boolean {
  return (
    role === 'mentor_teacher' ||
    role === 'supervisor_professor' ||
    role === 'school_principal'
  );
}

/**
 * کوئری مشترک فراگیرانِ میز کار. باکس شمار فراگیران/معلمان و باکس میانگین نمرهٔ
 * دروس هر دو همین key را با `select` جدا می‌خوانند، پس فقط یک بار از سرور
 * بارگذاری می‌شود.
 */
export function dashboardTraineesQueryOptions(role: UserRole) {
  return queryOptions({
    queryKey: DASHBOARD_QUERY.dashboardTrainees(role),
    queryFn: loadDashboardTrainees,
    staleTime: QUERY_STALE_MS.module,
    enabled: canLoadDashboardTrainees(role),
  });
}

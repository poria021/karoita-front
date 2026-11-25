'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { InternshipEnrollmentService } from '@/services/internship-enrollment.service';

import {
  mentorCapacityToSummary,
  type CapacitySummary,
} from '../lib/mentor-capacity-summary';

/**
 * کارت‌های ظرفیت استاد راهنما از `GET /student-enrollments/mentor/capacity?semesterId=`.
 * با تغییر ترم (`termId`) کلید عوض می‌شود و API دوباره صدا زده می‌شود.
 * اگر درخواست خطا بدهد یا پاسخ ظرفیت کل نداشته باشد، `fallback` (خلاصهٔ محلی جدول) نشان داده می‌شود.
 */
export function useMentorCapacitySummary(
  termId: string,
  fallback: CapacitySummary | null
): { summary: CapacitySummary | null; isLoading: boolean } {
  const query = useQuery({
    queryKey: DASHBOARD_QUERY.orgCapacitiesMentor(termId),
    queryFn: () => InternshipEnrollmentService.getMentorCapacity(termId),
    enabled: Boolean(termId),
    retry: false,
  });

  const live = useMemo(() => mentorCapacityToSummary(query.data), [query.data]);
  const waiting = Boolean(termId) && query.isPending;

  return { summary: live ?? (waiting ? null : fallback), isLoading: waiting };
}

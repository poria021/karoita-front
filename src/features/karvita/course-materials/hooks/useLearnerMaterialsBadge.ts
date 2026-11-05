'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { CourseMaterialsService } from '@/services/course-materials.service';
import { useUserStore } from '@/store/useUserStore';
import type { InternshipCourseKind } from '@/types/internship-enrollment';

import {
  countNewCourseMaterials,
  markCourseMaterialsSeen,
  readMaterialsSeenAt,
} from '../lib/learner-materials-seen';

/**
 * شمارش جزوه‌های جدید برای بج دکمهٔ صندوق — وابسته به آخرین بازدید محلی.
 */
export function useLearnerMaterialsBadge(
  kind: InternshipCourseKind,
  courseKey: string
) {
  const userId = useUserStore((state) => state.activeUser?.id ?? '');
  const [seenAt, setSeenAt] = useState<string | null>(null);

  useEffect(() => {
    setSeenAt(readMaterialsSeenAt(userId, courseKey));
  }, [userId, courseKey]);

  const query = useQuery({
    queryKey: [...DASHBOARD_QUERY.courseMaterialsReceived, kind, courseKey],
    queryFn: () => CourseMaterialsService.listReceived(kind, courseKey),
    staleTime: QUERY_STALE_MS.list,
    retry: false,
    enabled: Boolean(courseKey),
  });

  const materials = query.data ?? [];
  const newCount = countNewCourseMaterials(materials, seenAt);

  const markSeen = useCallback(() => {
    markCourseMaterialsSeen(userId, courseKey, materials);
    setSeenAt(readMaterialsSeenAt(userId, courseKey));
  }, [userId, courseKey, materials]);

  return {
    newCount,
    hasNew: newCount > 0,
    markSeen,
    isLoading: query.isLoading,
  };
}

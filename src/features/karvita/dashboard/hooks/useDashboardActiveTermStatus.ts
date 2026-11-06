'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { SyllabusConfigService } from '@/services/syllabus-config.service';
import type { AcademicTermType } from '@/types/syllabus-config';

import {
  buildActiveTermStatusView,
  type ActiveTermStatusView,
} from '../lib/active-term-status';

export type DashboardActiveTermStatusState = {
  audience: AcademicTermType;
  setAudience: (audience: AcademicTermType) => void;
  isLoading: boolean;
  isError: boolean;
  view: ActiveTermStatusView;
};

/**
 * آخرین ترم فعال ترمی/پودمانی برای میز کار مدیر ارشد.
 */
export function useDashboardActiveTermStatus(): DashboardActiveTermStatusState {
  const [audience, setAudience] = useState<AcademicTermType>('semester');

  const query = useQuery({
    queryKey: DASHBOARD_QUERY.syllabusSnapshot,
    queryFn: () => SyllabusConfigService.getSnapshot(),
    staleTime: QUERY_STALE_MS.module,
  });

  const view = useMemo(
    () => buildActiveTermStatusView(query.data, audience),
    [audience, query.data]
  );

  return {
    audience,
    setAudience,
    isLoading: query.isPending && !query.data,
    isError: query.isError && !query.data,
    view,
  };
}

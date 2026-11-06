'use client';

import { useQuery } from '@tanstack/react-query';

import { DAILY_APPROVAL_PASSING_SCORE } from '@/features/karvita/daily-approvals/constants';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { cn } from '@/lib/utils';
import { WORKBENCH_FULL_SPAN } from '@/lib/workbench-grid';
import { SyllabusConfigService } from '@/services/syllabus-config.service';

import { useLearnerWorkbenchSnapshot } from '../hooks/useLearnerWorkbenchSnapshot';
import {
  buildLearnerCourseWeekHighlights,
  buildLearnerGradeSeries,
} from '../lib/learner-workbench';
import { WorkbenchWeekStatusBox } from './WorkbenchWeekStatusBox';
import { WorkbenchWeeklyGradesBox } from './WorkbenchWeeklyGradesBox';

/**
 * ردیف میز کار فراگیر: وضعیت هفته‌ها | روند نمره هفتگی.
 * فقط دانشجو و مهارت‌آموز از ویجت `learner_grades` این را می‌بینند.
 */
export function DashboardLearnerGradesChart() {
  const desk = useLearnerWorkbenchSnapshot();

  const passingQuery = useQuery({
    queryKey: DASHBOARD_QUERY.passingScoreThreshold,
    queryFn: () => SyllabusConfigService.getPassingScoreThreshold(),
    staleTime: QUERY_STALE_MS.module,
    enabled: desk.enabled,
  });

  const series = buildLearnerGradeSeries(desk.snapshots);
  const highlights = buildLearnerCourseWeekHighlights(desk.snapshots);

  const minGrade =
    typeof passingQuery.data === 'number' && Number.isFinite(passingQuery.data)
      ? passingQuery.data
      : DAILY_APPROVAL_PASSING_SCORE;

  if (!desk.enabled) return null;

  if (!desk.isLoading && !desk.isError && series.length === 0 && highlights.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        WORKBENCH_FULL_SPAN,
        'grid grid-cols-1 gap-kv-group lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:items-stretch'
      )}
    >
      <WorkbenchWeekStatusBox highlights={highlights} />
      <WorkbenchWeeklyGradesBox
        series={series}
        isLoading={desk.isLoading}
        isError={desk.isError}
        minGrade={minGrade}
      />
    </div>
  );
}

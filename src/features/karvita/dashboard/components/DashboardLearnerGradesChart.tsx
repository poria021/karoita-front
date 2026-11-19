'use client';

import { useQuery } from '@tanstack/react-query';

import { DAILY_APPROVAL_PASSING_SCORE } from '@/features/karvita/daily-approvals/constants';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { cn } from '@/lib/utils';
import {
  WORKBENCH_FULL_BLEED_ROW_CLASS,
  WORKBENCH_LEARNER_GRADES_INNER_CLASS,
} from '@/lib/workbench-grid';
import { SyllabusConfigService } from '@/services/syllabus-config.service';

import { useLearnerWorkbenchSnapshot } from '../hooks/useLearnerWorkbenchSnapshot';
import {
  buildLearnerCourseWeekRows,
  buildLearnerGradeSeries,
} from '../lib/learner-workbench';
import {
  FAKE_LEARNER_SNAPSHOTS,
  LEARNER_WORKBENCH_FAKE_PREVIEW,
} from '../lib/learner-workbench-preview';
import { WorkbenchCourseWeeksBox } from './WorkbenchCourseWeeksBox';
import { WorkbenchWeeklyGradesBox } from './WorkbenchWeeklyGradesBox';

/**
 * ردیف میز کار فراگیر: وضعیت هفته‌ها و نمرهٔ دروس | روند نمره هفتگی — سلول تمام‌عرض شِل
 * (شامل ترک تبلیغ؛ تبلیغ فقط ردیف‌های بالا را باریک می‌کند). عرض وضعیت هفته‌ها بیشتر از روند نمره است.
 * همیشه نمایان است؛ بدون داده، باکس‌ها خالی (خط‌چین) ولی هم‌اندازه می‌مانند.
 */
export function DashboardLearnerGradesChart() {
  const desk = useLearnerWorkbenchSnapshot();

  const passingQuery = useQuery({
    queryKey: DASHBOARD_QUERY.passingScoreThreshold,
    queryFn: () => SyllabusConfigService.getPassingScoreThreshold(),
    staleTime: QUERY_STALE_MS.module,
    enabled: desk.enabled,
  });

  // پیش‌نمایش با داده‌ی فیک (فقط development) — برای خاموش کردن: learner-workbench-preview.ts
  const snapshots = LEARNER_WORKBENCH_FAKE_PREVIEW
    ? FAKE_LEARNER_SNAPSHOTS
    : desk.snapshots;

  const series = buildLearnerGradeSeries(snapshots);
  const courseRows = buildLearnerCourseWeekRows(snapshots);

  const minGrade =
    typeof passingQuery.data === 'number' && Number.isFinite(passingQuery.data)
      ? passingQuery.data
      : DAILY_APPROVAL_PASSING_SCORE;

  return (
    <div
      className={cn(
        WORKBENCH_FULL_BLEED_ROW_CLASS,
        WORKBENCH_LEARNER_GRADES_INNER_CLASS
      )}
    >
      <WorkbenchCourseWeeksBox rows={courseRows} />
      <WorkbenchWeeklyGradesBox
        series={series}
        isLoading={LEARNER_WORKBENCH_FAKE_PREVIEW ? false : desk.isLoading}
        isError={LEARNER_WORKBENCH_FAKE_PREVIEW ? false : desk.isError}
        isForbidden={LEARNER_WORKBENCH_FAKE_PREVIEW ? false : desk.isForbidden}
        minGrade={minGrade}
      />
    </div>
  );
}

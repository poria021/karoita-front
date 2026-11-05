'use client';

import { KvTypography } from '@/components/shared/KvTypography';
import { WORKBENCH_FULL_SPAN } from '@/lib/workbench-grid';
import { cn } from '@/lib/utils';

import { useLearnerWorkbenchSnapshot } from '../hooks/useLearnerWorkbenchSnapshot';
import { DashboardLearnerActiveCourseBox } from './DashboardLearnerActiveCourseBox';
import { DashboardLearnerMaterialsBox } from './DashboardLearnerMaterialsBox';
import { DashboardLearnerNextActionBox } from './DashboardLearnerNextActionBox';

/**
 * میز اختصاصی دانشجو/مهارت‌آموز زیر ردیف خوش‌آمد/اطلاعیه/تبلیغ:
 * اقدام بعدی → دورهٔ فعال + جزوات.
 */
export function DashboardLearnerDesk() {
  const desk = useLearnerWorkbenchSnapshot();

  if (!desk.enabled) return null;

  if (desk.isError) {
    return (
      <section
        aria-label="میز کار تحصیلی"
        className={cn(
          WORKBENCH_FULL_SPAN,
          'rounded-kv-shell border border-kv-border/70 bg-kv-surface p-kv-group shadow-kv-soft'
        )}
      >
        <KvTypography variant="body" tone="muted" as="p">
          خلاصه وضعیت تحصیلی فعلاً در دسترس نیست؛ کمی بعد دوباره تلاش کنید.
        </KvTypography>
      </section>
    );
  }

  return (
    <div
      className={cn(WORKBENCH_FULL_SPAN, 'grid gap-kv-group')}
      aria-label="میز کار تحصیلی"
    >
      <DashboardLearnerNextActionBox
        action={desk.nextAction}
        isLoading={desk.isLoading}
      />
      <div className="grid gap-kv-group md:grid-cols-2 md:items-stretch">
        <DashboardLearnerActiveCourseBox
          course={desk.activeCourse}
          isLoading={desk.isLoading}
        />
        <DashboardLearnerMaterialsBox
          course={desk.activeCourse}
          isLoading={desk.isLoading}
        />
      </div>
    </div>
  );
}

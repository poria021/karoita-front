'use client';

import type { CSSProperties } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

import { useDashboardRegionalCounts } from '../hooks/useDashboardRegionalCounts';
import { WorkbenchBoxBusy } from './WorkbenchBoxBusy';
import { WorkbenchCountCard } from './WorkbenchCountCard';
import { workbenchErrorText } from './WorkbenchUnavailableNote';

export type WorkbenchRegionalCountsBoxProps = {
  /**
   * ستون باریک تبلیغ دسکتاپ: کارت‌ها از md به بالا زیر هم.
   * موبایل (تمام‌عرض) همیشه سه کارت کنار هم.
   */
  stacked?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * «آمار منطقه» — میز کار آموزش و پرورش منطقه: تعداد مدارس، معلمان و فراگیران.
 */
export function WorkbenchRegionalCountsBox({
  stacked = false,
  className,
  style,
}: WorkbenchRegionalCountsBoxProps) {
  const { isLoading, isError, isForbidden, counts } = useDashboardRegionalCounts();

  return (
    <section
      aria-label="آمار منطقه"
      aria-busy={isLoading}
      style={style}
      className={cn(
        'grid min-h-0 grid-cols-3 gap-kv-group',
        stacked && 'md:grid-cols-1',
        className
      )}
    >
      {isLoading ? (
        <WorkbenchBoxBusy
          label="در حال بارگذاری آمار منطقه"
          className="col-span-full min-h-24"
        />
      ) : isError || counts == null ? (
        <div className="col-span-full flex min-h-24 items-center justify-center rounded-kv-control border border-dashed border-kv-border-strong px-2 py-3 text-center">
          <KvTypography variant="caption" tone="muted" as="p">
            {workbenchErrorText(isForbidden, 'آمار منطقه فعلاً در دسترس نیست.')}
          </KvTypography>
        </div>
      ) : (
        <>
          <WorkbenchCountCard
            icon={faIcons.school}
            label="مدارس"
            value={counts.schools}
            atLeast={counts.truncated}
          />
          <WorkbenchCountCard
            icon={faIcons.userTie}
            label="معلمان"
            value={counts.teachers}
            atLeast={counts.truncated}
          />
          <WorkbenchCountCard
            icon={faIcons.userGroup}
            label="فراگیران"
            value={counts.learners}
            atLeast={counts.truncated}
          />
        </>
      )}
    </section>
  );
}

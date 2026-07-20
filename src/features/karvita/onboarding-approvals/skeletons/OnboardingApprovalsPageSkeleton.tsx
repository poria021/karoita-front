'use client';

import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { KvSkeletonTabTrack } from '@/components/shared/skeleton/KvSkeletonChrome';
import { KvSplitWorkspace } from '@/components/shared/shell/KvSplitWorkspace';
import { KV_TABLE_VIEWPORT_HEIGHT } from '@/components/shared/table/kvTableViewportHeight';
import { cn } from '@/lib/utils';

/**
 * Cold skeleton — بررسی مدارک هویتی:
 * تب هم‌اندازه AppTabsList | سرچ | سلکت استان | جدول | پنل جزئیات
 * بدون بردر کارت اضافه دور اسکلتون.
 */
export function OnboardingApprovalsPageSkeleton() {
  return (
    <KvSplitWorkspace
      tabs={
        // ~۳ تب دسکتاپ AppTabsList (md:w-fit)
        <KvSkeletonTabTrack trackClassName="w-[28rem]" />
      }
      primary={
        <div
          className="flex w-full flex-col gap-kv-group"
          role="status"
          aria-busy="true"
          aria-label="در حال بارگذاری فهرست پرونده‌ها"
        >
          <div className="flex w-full flex-col items-stretch gap-kv-pair sm:flex-row sm:items-center">
            <KvSkeleton className="h-9 w-full flex-1 rounded-xl" />
            <KvSkeleton className="h-9 w-full rounded-xl sm:w-36" />
          </div>
          <KvSkeleton
            className={cn('w-full rounded-xl', KV_TABLE_VIEWPORT_HEIGHT)}
          />
        </div>
      }
      secondary={
        <KvSkeleton
          className={cn(
            'h-full min-h-[min(28rem,55dvh)] w-full rounded-xl',
            KV_TABLE_VIEWPORT_HEIGHT
          )}
          label="در حال بارگذاری جزئیات"
        />
      }
      mobile={
        <div className="space-y-3">
          <KvSkeleton className="h-9 w-full rounded-xl" />
          <KvSkeleton className="h-9 w-full rounded-xl" />
          <KvSkeleton
            className={cn('w-full rounded-xl', KV_TABLE_VIEWPORT_HEIGHT)}
          />
        </div>
      }
    />
  );
}

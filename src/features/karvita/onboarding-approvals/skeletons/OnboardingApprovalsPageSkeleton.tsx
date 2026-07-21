'use client';

import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { KvSkeletonTabTrack } from '@/components/shared/skeleton/KvSkeletonChrome';
import { KvSkeletonListRow } from '@/components/shared/skeleton/KvSkeletonCard';
import { KvSplitWorkspace } from '@/components/shared/shell/KvSplitWorkspace';
import { KV_TABLE_VIEWPORT_HEIGHT } from '@/components/shared/table/kvTableViewportHeight';
import { cn } from '@/lib/utils';

/**
 * Cold skeleton — آینهٔ OnboardingApprovalsPage:
 * tabs (lg) | فیلتر موبایل در toolbar | primary: FilterBar + KvCard/table | secondary: پنل جزئیات | mobile: ردیف‌ها
 */
export function OnboardingApprovalsPageSkeleton() {
  return (
    <KvSplitWorkspace
      tabs={
        <KvSkeletonTabTrack breakpoint="lg" trackClassName="w-[28rem]" />
      }
      toolbar={
        <div className="lg:hidden">
          <div className="flex w-full flex-col items-stretch gap-kv-pair">
            <KvSkeleton className="h-11 w-full rounded-xl" />
            <KvSkeleton className="h-9 w-full rounded-xl" />
          </div>
        </div>
      }
      primary={
        <>
          <div
            className="flex w-full flex-col items-stretch gap-kv-pair sm:flex-row sm:items-center"
            role="status"
            aria-busy="true"
            aria-label="در حال بارگذاری فهرست پرونده‌ها"
          >
            <KvSkeleton className="h-11 w-full flex-1 rounded-xl" />
            <KvSkeleton className="h-9 w-full shrink-0 rounded-xl sm:w-36" />
          </div>
          <KvCard>
            <KvSkeleton
              className={cn('w-full rounded-none', KV_TABLE_VIEWPORT_HEIGHT)}
            />
          </KvCard>
        </>
      }
      secondary={
        <KvCard tone="muted" fill>
          <KvCardContent
            padding="md"
            className={cn(
              'flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-kv-group',
              KV_TABLE_VIEWPORT_HEIGHT
            )}
          >
            <KvSkeleton className="size-12 rounded-full" />
            <KvSkeleton className="h-4 w-40 rounded-md" />
            <KvSkeleton className="h-3 w-56 max-w-full rounded-md" />
          </KvCardContent>
        </KvCard>
      }
      mobile={
        <div
          className="space-y-kv-group"
          role="status"
          aria-busy="true"
          aria-label="در حال بارگذاری فهرست پرونده‌ها"
        >
          <KvSkeletonListRow />
          <KvSkeletonListRow />
          <KvSkeletonListRow />
          <KvSkeletonListRow />
        </div>
      }
    />
  );
}

'use client';

import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { KvSkeletonTabTrack } from '@/components/shared/skeleton/KvSkeletonChrome';
import {
  KvSkeletonListRow,
  KvSkeletonTablePanel,
} from '@/components/shared/skeleton/KvSkeletonCard';
import { KvSplitWorkspace } from '@/components/shared/shell/KvSplitWorkspace';
import { KV_TABLE_VIEWPORT_HEIGHT } from '@/components/shared/table/kvTableViewportHeight';
import { cn } from '@/lib/utils';

function FiltersSkeleton({
  searchPlaceholderLabel,
}: {
  searchPlaceholderLabel: string;
}) {
  return (
    <div
      className="flex w-full flex-col items-stretch gap-kv-pair sm:flex-row sm:items-center"
      role="status"
      aria-busy="true"
      aria-label={searchPlaceholderLabel}
    >
      <div className="w-full flex-1">
        <KvSkeleton className="h-11 w-full rounded-kv-control" />
      </div>
      <div className="w-full shrink-0 sm:w-36">
        <KvSkeleton className="h-9 w-full rounded-kv-control" />
      </div>
    </div>
  );
}

/**
 * Cold skeleton — آینهٔ OnboardingApprovalsPage:
 * tabs | فیلتر موبایل در toolbar | primary: FilterBar + جدول | secondary: پنل خالی | mobile: ردیف‌ها
 */
export function OnboardingApprovalsPageSkeleton() {
  return (
    <KvSplitWorkspace
      tabs={
        <div className="mb-kv-section space-y-kv-group">
          <KvSkeletonTabTrack breakpoint="lg" trackClassName="w-[28rem]" />
        </div>
      }
      toolbar={
        <div className="lg:hidden">
          <FiltersSkeleton searchPlaceholderLabel="در حال بارگذاری فیلترها" />
        </div>
      }
      primary={
        <>
          <FiltersSkeleton searchPlaceholderLabel="در حال بارگذاری فهرست پرونده‌ها" />
          <div className="overflow-hidden rounded-kv-control border border-kv-border bg-kv-surface">
            <KvSkeletonTablePanel
              rows={7}
              headerCols={['w-28', 'w-20', 'w-24', 'w-16']}
              label="در حال بارگذاری جدول پرونده‌ها"
            />
          </div>
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
            <KvSkeleton className="h-4 w-40 rounded-kv-control" />
            <KvSkeleton className="h-3 w-56 max-w-full rounded-kv-control" />
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

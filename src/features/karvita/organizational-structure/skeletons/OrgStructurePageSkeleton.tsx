'use client';

import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { KvSkeletonTabTrack } from '@/components/shared/skeleton/KvSkeletonChrome';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';
import { KV_TABLE_VIEWPORT_HEIGHT } from '@/components/shared/table/kvTableViewportHeight';
import { cn } from '@/lib/utils';

/**
 * Cold skeleton — هم‌تراز با OrgStructurePage:
 * tabs (lg) → toolbar (border-t + title/search/add) → table viewport.
 */
export function OrgStructurePageSkeleton() {
  return (
    <KvWorkspace
      panel={false}
      tabs={
        <KvSkeletonTabTrack
          breakpoint="lg"
          trackClassName="w-[42rem]"
        />
      }
      toolbar={
        <div className="flex flex-col justify-start gap-kv-group border-t border-kv-border px-0 pt-kv-section sm:px-kv-group lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col items-start justify-start gap-kv-field text-start">
            <KvSkeleton className="h-5 w-48 rounded-md" />
            <KvSkeleton className="h-3 w-72 max-w-full rounded-md" />
          </div>

          <div className="flex w-full flex-col items-stretch gap-kv-inline sm:flex-row sm:items-center lg:w-auto lg:justify-end">
            <div className="w-full sm:w-64">
              <KvSkeleton className="h-11 w-full rounded-xl" />
            </div>
            <KvSkeleton className="h-11 w-full shrink-0 rounded-xl sm:w-36" />
          </div>
        </div>
      }
    >
      <div
        className="space-y-kv-group"
        role="status"
        aria-busy="true"
        aria-label="در حال بارگذاری ساختار سازمانی"
      >
        <KvSkeleton
          className={cn('w-full rounded-xl', KV_TABLE_VIEWPORT_HEIGHT)}
        />
      </div>
    </KvWorkspace>
  );
}

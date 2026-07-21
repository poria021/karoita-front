'use client';

import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { KvSkeletonTabTrack } from '@/components/shared/skeleton/KvSkeletonChrome';
import { KvSkeletonTablePanel } from '@/components/shared/skeleton/KvSkeletonCard';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';

/**
 * Cold skeleton — هم‌تراز با OrgStructurePage:
 * tabs (lg) → toolbar (border-t + title/search/add) → پنل کارت + جدول.
 */
export function OrgStructurePageSkeleton() {
  return (
    <KvWorkspace
      tabs={
        <div className="mb-kv-section space-y-kv-group">
          <KvSkeletonTabTrack
            breakpoint="lg"
            trackClassName="w-[42rem]"
          />
        </div>
      }
      toolbar={
        <div className="flex flex-col justify-start gap-kv-group border-t border-kv-border-muted px-0 pt-kv-section sm:px-kv-group lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col items-start justify-start gap-kv-field text-start">
            <KvSkeleton className="h-4 w-48 rounded-kv-control" />
            <KvSkeleton className="h-3 w-72 max-w-full rounded-kv-control" />
          </div>

          <div className="flex w-full flex-col items-stretch gap-kv-inline sm:flex-row sm:items-center lg:w-auto lg:justify-end">
            <div className="w-full sm:w-64">
              <KvSkeleton className="h-11 w-full rounded-kv-control" />
            </div>
            <KvSkeleton className="h-11 w-full shrink-0 rounded-kv-control sm:w-36" />
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
        <KvSkeletonTablePanel
          rows={8}
          headerCols={['w-40', 'w-16']}
          label="در حال بارگذاری جدول ساختار سازمانی"
        />
      </div>
    </KvWorkspace>
  );
}

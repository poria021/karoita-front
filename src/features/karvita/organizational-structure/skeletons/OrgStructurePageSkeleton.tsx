'use client';

import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { KvSkeletonTabTrack } from '@/components/shared/skeleton/KvSkeletonChrome';
import { KvSkeletonTablePanel } from '@/components/shared/skeleton/KvSkeletonCard';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';

/**
 * Cold skeleton — هم‌تراز با OrgStructurePage:
 * tabs (lg) → toolbar (title/search/add) → جدول بدون کارت اضافه.
 */
export function OrgStructurePageSkeleton() {
  return (
    <KvWorkspace
      panel={false}
      tabs={
        <div className="mb-kv-pair space-y-kv-group">
          <KvSkeletonTabTrack trackClassName="w-full lg:w-fit lg:min-w-[36rem]" />
        </div>
      }
      toolbar={
        <div className="flex flex-col justify-start gap-kv-group pt-kv-pair lg:flex-row lg:items-center lg:justify-between lg:ps-kv-group">
          <div className="flex min-w-0 flex-col items-start justify-start gap-kv-field text-start">
            <KvSkeleton className="h-4 w-48 rounded-kv-control" />
            <KvSkeleton className="h-3 w-72 max-w-full rounded-kv-control" />
          </div>

          <div className="flex w-full flex-col items-stretch gap-kv-inline sm:flex-row sm:items-center lg:w-auto lg:justify-end">
            <div className="w-full min-w-0 sm:flex-[2] lg:w-64 lg:flex-none">
              <KvSkeleton className="h-11 w-full rounded-kv-control" />
            </div>
            <KvSkeleton className="h-11 w-full shrink-0 rounded-kv-control sm:flex-1 lg:w-36 lg:flex-none" />
          </div>
        </div>
      }
    >
      <div
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

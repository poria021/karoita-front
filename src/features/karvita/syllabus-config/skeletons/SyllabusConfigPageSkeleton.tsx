'use client';

import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import {
  KvSkeletonGateCard,
  KvSkeletonStatusCard,
} from '@/components/shared/skeleton/KvSkeletonCard';
import { KvSkeletonTabTrack } from '@/components/shared/skeleton/KvSkeletonChrome';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';

/**
 * Cold skeleton — مدیریت ترم و سرفصل.
 * تب هم‌اندازه AppTabsList؛ کارت‌های وضعیت/گیت؛ ستون دروس + سرفصل.
 */
export function SyllabusConfigPageSkeleton() {
  return (
    <KvWorkspace
      panel={false}
      tabs={
        // ~۲ تب با لیبل‌های بلند دسکتاپ
        <KvSkeletonTabTrack trackClassName="w-[26rem]" />
      }
    >
      <div
        className="space-y-kv-section"
        role="status"
        aria-busy="true"
        aria-label="در حال بارگذاری مدیریت ترم و سرفصل"
      >
        <div className="grid grid-cols-1 items-stretch gap-kv-group md:grid-cols-3">
          <KvSkeletonGateCard />
          <KvSkeletonGateCard />
          <KvSkeletonStatusCard />
        </div>

        <div className="grid grid-cols-1 items-start gap-kv-section lg:grid-cols-12 lg:gap-kv-group">
          <KvSkeleton className="h-72 w-full rounded-xl lg:col-span-4 lg:h-80" />

          <div className="flex w-full flex-col gap-kv-group lg:col-span-8">
            <div className="flex flex-col gap-kv-group sm:flex-row sm:items-center sm:justify-between">
              <KvSkeleton className="h-5 w-56 rounded-md" />
              <KvSkeleton className="h-9 w-full rounded-xl sm:w-32" />
            </div>
            <KvSkeleton className="h-[400px] max-h-[400px] min-h-[200px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    </KvWorkspace>
  );
}

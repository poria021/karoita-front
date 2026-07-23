'use client';

import { KvCard } from '@/components/shared/KvCard';
import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import {
  KvSkeletonGateCard,
  KvSkeletonTermSelectCard,
} from '@/components/shared/skeleton/KvSkeletonCard';
import { KvSkeletonTablePanel } from '@/components/shared/skeleton/KvSkeletonCard';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';
import { cn } from '@/lib/utils';

/**
 * Cold skeleton — آینهٔ CourseOfferingsPanel:
 * TermStatusCards (۳ کارت) → جدول دروس (col-4) + سرفصل هفتگی (col-8).
 */
export function CourseOfferingsPageSkeleton() {
  return (
    <KvWorkspace panel={false}>
      <div
        className="space-y-kv-section"
        role="status"
        aria-busy="true"
        aria-label="در حال بارگذاری ارائه و سرفصل دروس"
      >
        <div className="grid grid-cols-1 items-stretch gap-kv-group md:grid-cols-3">
          <KvSkeletonGateCard />
          <KvSkeletonGateCard />
          <KvSkeletonTermSelectCard />
        </div>

        <div className="grid grid-cols-1 items-start gap-kv-section lg:grid-cols-12 lg:gap-kv-group">
          <div className="overflow-hidden rounded-kv-control border border-kv-border bg-kv-surface shadow-kv-raised lg:col-span-4">
            <KvSkeletonTablePanel
              rows={8}
              heightClassName="h-auto min-h-[18rem]"
              headerCols={['w-28', 'w-20']}
              label="در حال بارگذاری لیست دروس"
            />
          </div>

          <KvCard
            className={cn(
              'flex flex-col gap-kv-group lg:col-span-8',
              'rounded-none border-0 bg-transparent p-0 shadow-none',
              'md:rounded-kv-control md:border md:border-kv-border md:bg-kv-surface md:p-kv-group md:shadow-kv-raised'
            )}
          >
            <div className="flex flex-col gap-kv-group sm:flex-row sm:items-center sm:justify-between">
              <KvSkeleton className="h-4 w-56 max-w-full rounded-kv-control" />
              <KvSkeleton className="h-9 w-full rounded-kv-control sm:w-32" />
            </div>

            <div className="overflow-hidden rounded-kv-control border border-kv-border bg-kv-surface shadow-kv-raised">
              <KvSkeletonTablePanel
                rows={6}
                heightClassName="max-h-[400px] min-h-[200px]"
                headerCols={['w-36', 'w-24', 'w-20']}
                label="در حال بارگذاری سرفصل هفتگی"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end">
              <KvSkeleton className="h-11 w-full rounded-kv-control sm:w-72" />
            </div>
          </KvCard>
        </div>
      </div>
    </KvWorkspace>
  );
}

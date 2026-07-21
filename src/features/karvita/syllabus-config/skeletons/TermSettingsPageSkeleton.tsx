'use client';

import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import {
  KvSkeletonCardHeader,
  KvSkeletonMetricCard,
} from '@/components/shared/skeleton/KvSkeletonCard';
import { KvSkeletonField } from '@/components/shared/skeleton/KvSkeletonField';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';

/**
 * Cold skeleton — آینهٔ TermSettingsPanel:
 * TermFormCard (col-7) + GlobalSettingsCards (col-5).
 */
export function TermSettingsPageSkeleton() {
  return (
    <KvWorkspace panel={false}>
      <div
        className="grid w-full grid-cols-1 items-start gap-kv-group lg:grid-cols-12"
        role="status"
        aria-busy="true"
        aria-label="در حال بارگذاری تنظیمات عمومی ترم‌ها"
      >
        <div className="lg:col-span-7">
          <KvCard>
            <KvCardContent padding="md" className="space-y-kv-group">
              <KvSkeletonCardHeader
                className="gap-2.5 border-b border-kv-border pb-kv-pair"
                titleClassName="w-52"
                captionClassName="w-64"
              />

              <KvSkeletonField labelClassName="w-32" />
              <KvSkeletonField labelClassName="w-28" />

              <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2">
                <KvSkeletonField labelClassName="w-36" />
                <KvSkeletonField labelClassName="w-40" />
              </div>

              <div className="flex flex-col gap-2 border-t border-kv-border-muted pt-kv-group sm:flex-row sm:justify-end">
                <KvSkeleton className="h-11 w-full rounded-kv-control sm:w-44" />
              </div>
            </KvCardContent>
          </KvCard>
        </div>

        <div className="lg:col-span-5">
          <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2 lg:grid-cols-1">
            <KvSkeletonMetricCard />
            <KvSkeletonMetricCard />
          </div>
        </div>
      </div>
    </KvWorkspace>
  );
}

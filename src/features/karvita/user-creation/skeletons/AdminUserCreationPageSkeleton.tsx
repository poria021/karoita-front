'use client';

import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { KvSkeletonCardHeader } from '@/components/shared/skeleton/KvSkeletonCard';
import { KvSkeletonField } from '@/components/shared/skeleton/KvSkeletonField';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';

/**
 * Cold skeleton — آینهٔ دقیق AdminUserCreationForm
 * (KvCard + header + grid فیلد با لیبل + فوتر CTA).
 */
export function AdminUserCreationPageSkeleton() {
  return (
    <KvWorkspace panel={false}>
      <KvCard
        dir="rtl"
        className="mx-auto w-full max-w-xl gap-0 border-kv-border py-0 shadow-kv-raised"
      >
        <KvCardContent
          className="space-y-kv-section p-kv-inset sm:p-kv-block"
          role="status"
          aria-busy="true"
          aria-label="در حال بارگذاری ایجاد حساب‌های سازمانی"
        >
          <KvSkeletonCardHeader
            titleClassName="w-44"
            captionClassName="w-64"
          />

          <div className="space-y-kv-section">
            <div className="grid grid-cols-1 gap-kv-group text-start sm:grid-cols-2">
              <KvSkeletonField labelClassName="w-28" />
              <KvSkeletonField labelClassName="w-36" />
              <KvSkeletonField
                className="sm:col-span-2"
                labelClassName="w-32"
              />
              <KvSkeletonField
                className="sm:col-span-2"
                labelClassName="w-40"
              />
              <KvSkeletonField
                className="sm:col-span-2"
                labelClassName="w-36"
              />
            </div>

            <div className="mt-kv-group flex justify-end border-t border-kv-border pt-kv-group">
              <KvSkeleton className="h-11 w-52 rounded-kv-control" />
            </div>
          </div>
        </KvCardContent>
      </KvCard>
    </KvWorkspace>
  );
}

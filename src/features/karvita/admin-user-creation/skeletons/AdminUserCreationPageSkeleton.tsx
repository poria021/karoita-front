'use client';

import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';

/**
 * Cold skeleton — کارت فرم ایجاد حساب سازمانی (آینهٔ AdminUserCreationForm).
 */
export function AdminUserCreationPageSkeleton() {
  return (
    <KvWorkspace panel={false}>
      <div
        className="mx-auto w-full max-w-xl space-y-kv-group rounded-kv-panel border border-kv-border bg-kv-surface p-5 shadow-kv-raised sm:p-6"
        role="status"
        aria-busy="true"
        aria-label="در حال بارگذاری ایجاد حساب‌های سازمانی"
      >
        <div className="flex items-center gap-2.5 border-b border-kv-border pb-kv-pair">
          <KvSkeleton className="size-9 rounded-kv-control" />
          <div className="space-y-2">
            <KvSkeleton className="h-4 w-40 rounded-md" />
            <KvSkeleton className="h-3 w-56 max-w-full rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-kv-field sm:grid-cols-2">
          <KvSkeleton className="h-11 w-full rounded-xl" />
          <KvSkeleton className="h-11 w-full rounded-xl" />
          <KvSkeleton className="h-11 w-full rounded-xl sm:col-span-2" />
          <KvSkeleton className="h-11 w-full rounded-xl sm:col-span-2" />
          <KvSkeleton className="h-11 w-full rounded-xl sm:col-span-2" />
        </div>

        <div className="flex justify-end border-t border-kv-border pt-kv-pair">
          <KvSkeleton className="h-11 w-48 rounded-xl" />
        </div>
      </div>
    </KvWorkspace>
  );
}

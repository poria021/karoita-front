'use client';

import { KvSkeleton } from '@/components/shared/skeleton/KvSkeleton';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';

/**
 * Cold skeleton — هم‌تراز با AdminUserCreationForm (اسپیسینگ kv از globals).
 */
export function AdminUserCreationPageSkeleton() {
  return (
    <KvWorkspace panel={false}>
      <div
        className="mx-auto w-full max-w-xl space-y-kv-section rounded-kv-panel border border-kv-border bg-kv-surface p-kv-inset shadow-kv-raised sm:p-kv-block"
        role="status"
        aria-busy="true"
        aria-label="در حال بارگذاری ایجاد حساب‌های سازمانی"
      >
        <div className="flex items-center gap-kv-pair border-b border-kv-border pb-kv-inline">
          <KvSkeleton className="size-9 shrink-0 rounded-kv-control" />
          <div className="min-w-0 space-y-kv-field">
            <KvSkeleton className="h-4 w-40 rounded-md" />
            <KvSkeleton className="h-3 w-56 max-w-full rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2">
          <KvSkeleton className="h-11 w-full rounded-xl" />
          <KvSkeleton className="h-11 w-full rounded-xl" />
          <KvSkeleton className="h-11 w-full rounded-xl sm:col-span-2" />
          <KvSkeleton className="h-11 w-full rounded-xl sm:col-span-2" />
          <KvSkeleton className="h-11 w-full rounded-xl sm:col-span-2" />
        </div>

        <div className="mt-kv-group flex justify-end border-t border-kv-border pt-kv-group">
          <KvSkeleton className="h-11 w-48 rounded-xl" />
        </div>
      </div>
    </KvWorkspace>
  );
}

'use client';

import { KvTypography } from '@/components/shared/KvTypography';
import { SuperAdminModuleGuard } from '@/components/shared/shell/SuperAdminModuleGuard';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';

/**
 * Phase 1 placeholder — CMS forms/tables land in a later phase.
 * Nest upload/CRUD endpoints are not wired (real mode fail-closed via Facade).
 */
export function LandingCmsPage() {
  return (
    <SuperAdminModuleGuard>
      <KvWorkspace panel={false}>
        <div className="flex flex-col gap-kv-group p-kv-inset">
          <KvTypography variant="title" as="h1">
            مدیریت محتوای لندینگ
          </KvTypography>
          <KvTypography variant="body" tone="muted" as="p">
            اسکلت مسیر ادمین آماده است. فرم‌ها و جداول CMS در فاز بعد اضافه
            می‌شوند. در حالت real، Facade هنوز به Nest متصل نیست.
          </KvTypography>
        </div>
      </KvWorkspace>
    </SuperAdminModuleGuard>
  );
}

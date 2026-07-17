import { LayoutDashboard } from 'lucide-react';

import { KvTypography } from '@/components/shared/KvTypography';

/**
 * Placeholder dashboard landing page — proves out the `(dashboard)` layout
 * shell (`Header` + `Sidebar` + `DashboardMainViewport`) from task 4. Stays
 * a plain Server Component (rule 00, #8: RSC by default) since it has no
 * interactivity of its own yet.
 */
export default function KarvitaDashboardPage() {
  return (
    <div className="flex w-full flex-col">
      <div className="mb-5 flex w-full flex-col items-start gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 text-start sm:items-center">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-kv-control bg-brand-500/10 text-brand-600">
            <LayoutDashboard className="size-5" aria-hidden="true" />
          </div>
          <div className="flex min-w-0 flex-col">
            <KvTypography variant="title" as="h2" truncate>
              میز کار
            </KvTypography>
            <div className="mt-1">
              <KvTypography variant="caption" tone="muted">
                به پرتال آموزشی سامانه کارویتا خوش آمدید.
              </KvTypography>
            </div>
          </div>
        </div>
      </div>

      <KvTypography variant="body" tone="muted" weight="bold">
        محتوای این صفحه به‌زودی تکمیل می‌شود.
      </KvTypography>
    </div>
  );
}

import { LayoutDashboard } from 'lucide-react';

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
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
            <LayoutDashboard className="size-5" aria-hidden="true" />
          </div>
          <div className="flex min-w-0 flex-col">
            <h2 className="truncate text-sm font-black leading-tight text-slate-900">میز کار</h2>
            <p className="mt-1 text-[11px] font-bold leading-normal text-slate-400">
              به پرتال آموزشی سامانه کارویتا خوش آمدید.
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs font-bold text-slate-500">محتوای این صفحه به‌زودی تکمیل می‌شود.</p>
    </div>
  );
}

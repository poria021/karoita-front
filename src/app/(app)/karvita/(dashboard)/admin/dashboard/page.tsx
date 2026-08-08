import { WorkbenchHome } from '@/features/karvita/dashboard/components/WorkbenchHome';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('admin-dashboard');

export default function KarvitaAdminDashboardPage() {
  return (
    <WorkbenchHome
      subtitle="میان‌بر به ماژول‌های حاکمیتی فعال سامانه کارویتا."
      emptyDescription="هیچ ماژول مدیریتی زنده‌ای برای میان‌بر ثبت نشده است."
    />
  );
}

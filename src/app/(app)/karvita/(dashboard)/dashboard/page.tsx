import { WorkbenchHomeModule } from '@/features/karvita/dashboard/components/WorkbenchHomeModule';
import { dashboardModuleMetadata } from '@/lib/dashboard-module-metadata';

export const metadata = dashboardModuleMetadata('dashboard');

export default function KarvitaDashboardPage() {
  return (
    <WorkbenchHomeModule
      subtitle="خلاصهٔ وضعیت و میان‌بر به ماژول‌های فعال نقش شما."
      emptyDescription="ماژول‌های نقش شما هنوز در این نسخه فعال نشده‌اند یا پس از تأیید پرونده در دسترس قرار می‌گیرند. از منوی کناری پروفایل را کامل کنید."
    />
  );
}

import { WorkbenchHome } from '@/features/karvita/dashboard/components/WorkbenchHome';

export default function KarvitaDashboardPage() {
  return (
    <WorkbenchHome
      subtitle="خلاصهٔ وضعیت و میان‌بر به ماژول‌های فعال نقش شما."
      emptyDescription="ماژول‌های نقش شما هنوز در این نسخه فعال نشده‌اند یا پس از تأیید پرونده در دسترس قرار می‌گیرند. از منوی کناری پروفایل را کامل کنید."
    />
  );
}

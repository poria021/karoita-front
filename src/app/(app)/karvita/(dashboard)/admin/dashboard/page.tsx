import { FaIcon } from '@/components/shared/FaIcon';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { faIcons } from '@/utils/iconMap';

/**
 * Super-admin control-plane landing — distinct from the shared user dashboard.
 * Module title/description come from `ModulePageHeader`.
 */
export default function KarvitaAdminDashboardPage() {
  return (
    <KvEmptyState
      icon={<FaIcon icon={faIcons.userShield} size="lg" />}
      title="میز کار مدیریت به‌زودی آماده می‌شود"
      description="پنل حاکمیتی سامانه کارویتا در حال تکمیل است. پس از فعال‌سازی ماژول‌ها، بررسی مدارک و میان‌برهای مدیریتی اینجا نمایش داده می‌شود."
    />
  );
}

import { FaIcon } from '@/components/shared/FaIcon';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { faIcons } from '@/utils/iconMap';

/**
 * Placeholder dashboard landing — designed empty state until module content ships.
 * Module title/description come from `ModulePageHeader` (do not duplicate here).
 */
export default function KarvitaDashboardPage() {
  return (
    <KvEmptyState
      icon={<FaIcon icon={faIcons.tableColumns} size="lg" />}
      title="میز کار به‌زودی آماده می‌شود"
      description="این بخش در حال تکمیل است. پس از فعال‌سازی ماژول‌ها، خلاصه وضعیت و میان‌برهای کاری اینجا نمایش داده می‌شود."
    />
  );
}

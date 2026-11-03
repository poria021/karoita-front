'use client';

import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { useUserPermissionsPolicy } from '@/features/karvita/user-permissions/hooks/useUserPermissionsPolicy';
import { REPORT_ACCESS_PROVINCES, REPORT_ACCESS_ROLES } from '@/services/report-access-policy';

const roleLabels: Record<string, string> = {
  mentor_teacher: 'معلم راهنما',
  supervisor_professor: 'استاد راهنما',
  school_principal: 'مدیر مدرسه',
  regional_edu_admin: 'آموزش و پرورش منطقه',
  faculty_role: 'مدیر دانشکده',
  provincial_university: 'دانشگاه استانی',
  central_organization: 'سازمان مرکزی',
  assistant_admin: 'دستیار مدیر ارشد',
  super_admin: 'مدیر ارشد',
};

const reportLabels: Record<string, string> = {
  'mentor-reports': 'گزارش معلم راهنما',
  'principal-reports': 'گزارش مدیر مدرسه',
  'regional-reports': 'گزارش آموزش و پرورش منطقه',
  'faculty-reports': 'گزارش مدیر دانشکده',
  'provincial-reports': 'گزارش دانشگاه استانی',
  'central-reports': 'گزارش سازمان مرکزی',
  'admin-reports': 'گزارش مدیر ارشد',
};

export function UserPermissionsPageClient() {
  const {
    rules,
    totalRules,
    enabledViewRules,
    disabledCompareRules,
    toggleView,
    toggleCompare,
  } = useUserPermissionsPolicy();

  const totalRoles = REPORT_ACCESS_ROLES.length;
  const totalProvinces = REPORT_ACCESS_PROVINCES.length;

  return (
    <div className="space-y-kv-group">
      <header className="flex flex-col gap-kv-group border-b border-kv-border pb-kv-group sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-kv-pair">
          <KvTypography variant="title" as="h2">
            مدیریت دسترسی‌ها
          </KvTypography>
          <KvTypography variant="body" tone="muted" as="p">
            کنترل دسترسی گزارش‌ها و مقایسه برای هر نقش در هر استان به‌صورت دقیق و سطح‌بندی‌شده.
          </KvTypography>
        </div>

        <div className="flex gap-kv-pair">
          <KvButton type="button" size="sm" appearance="ghost">
            اعمال تغییرات
          </KvButton>
          <KvButton type="button" size="sm" appearance="solid">
            افزودن قانون جدید
          </KvButton>
        </div>
      </header>

      <section className="grid gap-kv-group md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-kv-panel border border-kv-border bg-kv-surface p-kv-section">
          <KvTypography variant="body" tone="muted" as="p">
            کل قوانین
          </KvTypography>
          <KvTypography variant="title" as="h3">
            {totalRules}
          </KvTypography>
        </div>
        <div className="rounded-kv-panel border border-kv-border bg-kv-surface p-kv-section">
          <KvTypography variant="body" tone="muted" as="p">
            دسترسی‌های فعال
          </KvTypography>
          <KvTypography variant="title" as="h3">
            {enabledViewRules}
          </KvTypography>
        </div>
        <div className="rounded-kv-panel border border-kv-border bg-kv-surface p-kv-section">
          <KvTypography variant="body" tone="muted" as="p">
            مقایسه غیرفعال
          </KvTypography>
          <KvTypography variant="title" as="h3">
            {disabledCompareRules}
          </KvTypography>
        </div>
        <div className="rounded-kv-panel border border-kv-border bg-kv-surface p-kv-section">
          <KvTypography variant="body" tone="muted" as="p">
            نقش‌ها × استان‌ها
          </KvTypography>
          <KvTypography variant="title" as="h3">
            {totalRoles} × {totalProvinces}
          </KvTypography>
        </div>
      </section>

      <section className="rounded-kv-panel border border-kv-border bg-kv-surface p-kv-section">
        <div className="mb-kv-group flex items-center justify-between">
          <KvTypography variant="subtitle" as="h3">
            کنترل دقیق دسترسی گزارش‌ها به‌تفکیک نقش و استان
          </KvTypography>
          <KvTypography variant="body" tone="muted" as="span">
            هر سطر = یک نقش × یک استان × یک گزارش
          </KvTypography>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-start text-kv-muted">
                <th className="px-2 py-2">نقش</th>
                <th className="px-2 py-2">استان</th>
                <th className="px-2 py-2">گزارش</th>
                <th className="px-2 py-2 text-center">دسترسی به گزارش</th>
                <th className="px-2 py-2 text-center">دسترسی به مقایسه</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => {
                const ruleKey = `${rule.role}:${rule.province}:${rule.reportKey}`;
                return (
                  <tr key={ruleKey} className="rounded-kv-panel border border-kv-border bg-kv-surface-muted">
                    <td className="px-2 py-3">{roleLabels[rule.role] ?? rule.role}</td>
                    <td className="px-2 py-3">{rule.province}</td>
                    <td className="px-2 py-3">{reportLabels[rule.reportKey] ?? rule.reportKey}</td>
                    <td className="px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={rule.canView}
                        onChange={(event) => toggleView(ruleKey, event.target.checked)}
                        aria-label={`دسترسی گزارش ${reportLabels[rule.reportKey] ?? rule.reportKey}`}
                      />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={rule.canCompare && rule.canView}
                        disabled={!rule.canView}
                        onChange={(event) => toggleCompare(ruleKey, event.target.checked)}
                        aria-label={`دسترسی مقایسه ${reportLabels[rule.reportKey] ?? rule.reportKey}`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-kv-panel border border-kv-border bg-kv-surface p-kv-section">
        <KvTypography variant="subtitle" as="h3">
          نمونهٔ سیاست اعمال‌شده
        </KvTypography>
        <ul className="mt-kv-group space-y-kv-pair text-sm text-kv-muted">
          <li>اگر دسترسی گزارش برای نقش در استان غیرفعال شود، نقش آن استان نمی‌تواند گزارش را ببیند.</li>
          <li>اگر دسترسی گزارش فعال باشد ولی مقایسه غیرفعال شود، نقش گزارش را می‌بیند ولی دکمهٔ مقایسه قفل می‌شود.</li>
          <li>مدیر ارشد می‌تواند به‌صورت دقیق برای هر نقش، استان و نوع گزارش، این دو تنظیم را جداگانه کنترل کند.</li>
        </ul>
      </section>
    </div>
  );
}

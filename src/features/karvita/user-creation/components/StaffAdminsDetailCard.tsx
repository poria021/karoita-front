'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import {
  KvCard,
  KvCardContent,
} from '@/components/shared/KvCard';
import { KvCardTitleIcon } from '@/components/shared/KvCardTitleIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import type { StaffAdminAccount } from '@/types/admin-user-creation';
import { faIcons } from '@/utils/iconMap';
import { formatJalaliSlashDisplay } from '@/utils/formatJalaliDate';
import { toPersianDigits } from '@/utils/persianDigits';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

function statusLabel(name: string): string {
  if (name === 'active') return 'فعال';
  if (name === 'inactive' || name === 'disabled') return 'غیرفعال';
  return name || '—';
}

function createdLabel(iso: string): string {
  if (!iso.trim()) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return formatJalaliSlashDisplay(date);
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-kv-micro">
      <KvTypography variant="overline" tone="muted" as="p">
        {label}
      </KvTypography>
      <KvTypography variant="body" as="p">
        {value}
      </KvTypography>
    </div>
  );
}

type StaffAdminsDetailCardProps = {
  admin: StaffAdminAccount | null;
  isLoading: boolean;
  errorMessage: string | null;
};

export function StaffAdminsDetailCard({
  admin,
  isLoading,
  errorMessage,
}: StaffAdminsDetailCardProps) {
  if (!admin && !isLoading && !errorMessage) return null;

  return (
    <KvCard className="gap-0 border-kv-border py-0 shadow-kv-raised">
      <KvCardContent className="space-y-kv-group p-kv-inset sm:p-kv-block">
        <div className="flex items-center gap-kv-pair border-b border-kv-border pb-kv-inline">
          <KvCardTitleIcon icon={faIcons.user} />
          <KvTypography variant="subtitle" as="h4">
            جزئیات حساب ستادی
          </KvTypography>
        </div>

        {errorMessage ? (
          <KvTypography variant="caption" tone="danger" as="p">
            {errorMessage}
          </KvTypography>
        ) : null}

        {isLoading && !admin ? (
          <div
            className="flex items-center gap-kv-pair"
            role="status"
            aria-label="در حال دریافت جزئیات"
          >
            <FaIcon icon={faIcons.spinner} size="sm" spin className="text-kv-brand" />
            <KvTypography variant="caption" tone="muted" as="p">
              در حال دریافت جزئیات
            </KvTypography>
          </div>
        ) : admin ? (
          <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2">
            <Field
              label="نام"
              value={`${admin.firstName} ${admin.lastName}`.trim() || '—'}
            />
            <Field
              label="نقش"
              value={getRoleStrategy(admin.role).label}
            />
            <div className="space-y-kv-micro">
              <KvTypography variant="overline" tone="muted" as="p">
                موبایل
              </KvTypography>
              <KvTypography variant="body" as="p" className="font-mono" dir="ltr">
                {admin.mobile ? toPersianDigits(admin.mobile) : '—'}
              </KvTypography>
            </div>
            <Field label="وضعیت" value={statusLabel(admin.statusName)} />
            <Field label="تاریخ ایجاد" value={createdLabel(admin.createdAt)} />
          </div>
        ) : null}
      </KvCardContent>
    </KvCard>
  );
}

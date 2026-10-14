'use client';

import { useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvSwitch } from '@/components/shared/fields/KvSwitch';
import { KvTypography } from '@/components/shared/KvTypography';
import { faIcons } from '@/utils/iconMap';

type DailyApprovalCanWatchOthersToggleProps = {
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => Promise<void>;
};

/**
 * PATCH `student-weeks/{id}/can-watch-others` (فقط استاد راهنما) — مستقل از
 * نمره‌دهی است، پس روی هفتهٔ نمره‌خورده هم فعال می‌ماند و فوری ذخیره می‌شود.
 */
export function DailyApprovalCanWatchOthersToggle({
  checked,
  disabled = false,
  onChange,
}: DailyApprovalCanWatchOthersToggleProps) {
  const [pending, setPending] = useState(false);

  return (
    <div className="flex items-start justify-between gap-kv-stack rounded-kv-panel border border-kv-border bg-kv-surface p-kv-stack">
      <div className="flex min-w-0 items-start gap-kv-pair">
        <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-kv-brand-soft text-kv-brand">
          <FaIcon icon={checked ? faIcons.eye : faIcons.eyeSlash} size="sm" />
        </span>
        <div className="min-w-0 space-y-0.5">
          <KvTypography variant="label" as="p">
            مشاهدهٔ گزارش هم‌کلاسی‌ها
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            با فعال‌سازی، این کارورز می‌تواند گزارش‌های این هفتهٔ سایر کارورزان
            کلاس را برای الگوگیری ببیند. تغییر فوراً ذخیره می‌شود.
          </KvTypography>
        </div>
      </div>
      <KvSwitch
        aria-label="اجازهٔ مشاهدهٔ گزارش هم‌کلاسی‌ها"
        checked={checked}
        disabled={disabled || pending}
        onCheckedChange={(next) => {
          setPending(true);
          void onChange(next).finally(() => setPending(false));
        }}
      />
    </div>
  );
}

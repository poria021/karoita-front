'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { FORWARD_TARGET_LABEL } from '@/services/daily-approvals/forward-visibility';
import type {
  DailyApprovalForwardTarget,
  DailyApprovalWeek,
} from '@/types/daily-approvals';
import { faIcons } from '@/utils/iconMap';

const TARGETS: DailyApprovalForwardTarget[] = ['mentor', 'principal'];

type DailyApprovalForwardPanelProps = {
  week: DailyApprovalWeek;
  /** بعد از نمرهٔ نهایی ارجاع جدید ممکن نیست؛ فقط وضعیت نشان داده می‌شود. */
  readOnly: boolean;
  busy: boolean;
  onForward: (target: DailyApprovalForwardTarget) => void;
};

/**
 * گزارش دانشجو اول فقط دست استاد است؛ اینجا با صلاح‌دید استاد برای معلم راهنما
 * و/یا مدیر مدرسه ارجاع می‌شود تا بتوانند نظر بدهند.
 */
export function DailyApprovalForwardPanel({
  week,
  readOnly,
  busy,
  onForward,
}: DailyApprovalForwardPanelProps) {
  const forwarded = week.forwardedTo ?? [];
  if (readOnly && forwarded.length === 0) return null;

  return (
    <div className="space-y-kv-pair rounded-kv-panel border border-kv-border bg-kv-surface-muted p-kv-group">
      <div className="flex items-center gap-kv-pair">
        <FaIcon icon={faIcons.paperPlane} size="xs" className="text-kv-brand" />
        <KvTypography variant="subtitle" as="h4">
          ارجاع گزارش
        </KvTypography>
      </div>
      <KvTypography variant="caption" tone="muted" as="p">
        این گزارش فعلاً فقط برای شما قابل مشاهده است. در صورت صلاح‌دید می‌توانید
        آن را برای معلم راهنما یا مدیر مدرسه ارسال کنید تا نظرشان را ثبت کنند.
        پس از ثبت نمرهٔ نهایی ارجاع جدید ممکن نیست.
      </KvTypography>
      <div className="flex flex-wrap gap-kv-pair">
        {TARGETS.map((target) => {
          const done = forwarded.includes(target);
          return (
            <KvButton
              key={target}
              type="button"
              size="sm"
              color={done ? 'success' : 'neutral'}
              appearance="secondary"
              disabled={done || readOnly || busy}
              onClick={() => onForward(target)}
              icon={
                <FaIcon
                  icon={done ? faIcons.check : faIcons.paperPlane}
                  size="xs"
                />
              }
              iconPosition="start"
            >
              {done
                ? `ارسال شد برای ${FORWARD_TARGET_LABEL[target]}`
                : `ارسال برای ${FORWARD_TARGET_LABEL[target]}`}
            </KvButton>
          );
        })}
      </div>
    </div>
  );
}

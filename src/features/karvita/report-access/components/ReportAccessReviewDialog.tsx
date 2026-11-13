'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvDialog,
  KvDialogContent,
  KvDialogDescription,
  KvDialogFooter,
  KvDialogHeader,
  KvDialogTitle,
} from '@/components/shared/KvDialog';
import { KvTypography } from '@/components/shared/KvTypography';
import {
  REPORT_ACCESS_ROLES,
  displayTitleForKey,
  isCompareKey,
} from '@/features/karvita/report-access/constants';
import type { ReportAccessDiff } from '@/types/report-access';
import { getRoleStrategy } from '@/utils/role-strategy';
import { faIcons } from '@/utils/iconMap';
import { Badge } from '@/components/ui/badge';

type ReportAccessReviewDialogProps = {
  open: boolean;
  diffs: ReportAccessDiff[];
  summary: string;
  isSaving: boolean;
  provinceLabel: (ids: string[]) => string;
  onClose: () => void;
  onConfirm: () => void;
};

export function ReportAccessReviewDialog({
  open,
  diffs,
  summary,
  isSaving,
  provinceLabel,
  onClose,
  onConfirm,
}: ReportAccessReviewDialogProps) {
  const onlyCompareRevokes =
    diffs.some((d) => d.rem.length > 0) &&
    diffs.filter((d) => d.rem.length > 0).every((d) => isCompareKey(d.key));

  const hasRevokes = diffs.some((d) => d.rem.length > 0);

  return (
    <KvDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <KvDialogContent size="lg" className="max-h-[90dvh] overflow-hidden">
        <KvDialogHeader>
          <KvDialogTitle>بازبینی تغییرات دسترسی</KvDialogTitle>
          <KvDialogDescription>{summary}</KvDialogDescription>
        </KvDialogHeader>

        <div className="min-h-0 flex-1 space-y-kv-group overflow-y-auto py-kv-inline">
          {REPORT_ACCESS_ROLES.map((roleId) => {
            const items = diffs.filter((d) => d.roleId === roleId);
            if (!items.length) return null;

            const rows: {
              key: string;
              title: string;
              provinces: string;
              badge: string;
              tone: 'ok' | 'bad';
            }[] = [];

            for (const d of items) {
              if (d.add.length) {
                rows.push({
                  key: `${d.key}-add`,
                  title: displayTitleForKey(d.key),
                  provinces: provinceLabel(d.add),
                  badge: 'اعطای دسترسی',
                  tone: 'ok',
                });
              }
              if (d.rem.length) {
                rows.push({
                  key: `${d.key}-rem`,
                  title: displayTitleForKey(d.key),
                  provinces: provinceLabel(d.rem),
                  badge: 'لغو دسترسی',
                  tone: 'bad',
                });
              }
            }

            return (
              <section key={roleId} className="space-y-kv-pair">
                <KvTypography as="h3" variant="subtitle">
                  {getRoleStrategy(roleId).label}
                </KvTypography>
                <ul className="divide-y divide-kv-border-muted rounded-kv-panel border border-kv-border">
                  {rows.map((row) => (
                    <li
                      key={row.key}
                      className="flex items-center justify-between gap-kv-inline px-kv-group py-kv-inline"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <KvTypography as="span" variant="subtitle">
                          {row.title}
                        </KvTypography>
                        <KvTypography as="span" variant="caption" tone="muted">
                          {row.provinces}
                        </KvTypography>
                      </div>
                      <Badge
                        variant={row.tone === 'ok' ? 'success' : 'danger'}
                      >
                        {row.badge}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          {hasRevokes ? (
            <KvTypography as="p" variant="caption" tone="muted">
              {onlyCompareRevokes
                ? 'کاربران نقش‌های مربوط پس از ثبت، دیگر امکان مقایسه در گزارش‌های لغوشده را ندارند.'
                : 'کاربران نقش‌های مربوط پس از ثبت، دیگر گزارش‌های لغوشده را در منوی خود نمی‌بینند.'}
            </KvTypography>
          ) : null}
        </div>

        <KvDialogFooter>
          <KvButton
            type="button"
            appearance="secondary"
            color="neutral"
            onClick={onClose}
            disabled={isSaving}
          >
            بازگشت
          </KvButton>
          <KvButton
            type="button"
            loading={isSaving}
            icon={<FaIcon icon={faIcons.check} size="sm" />}
            onClick={onConfirm}
          >
            ثبت نهایی تغییرات
          </KvButton>
        </KvDialogFooter>
      </KvDialogContent>
    </KvDialog>
  );
}

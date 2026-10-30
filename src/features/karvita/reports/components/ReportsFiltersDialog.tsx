'use client';

import { KvButton } from '@/components/shared/KvButton';
import {
  KvDialog,
  KvDialogContent,
  KvDialogDescription,
  KvDialogFooter,
  KvDialogHeader,
  KvDialogTitle,
} from '@/components/shared/KvDialog';
import {
  KvSelect,
  KvSelectContent,
  KvSelectItem,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/fields/KvSelect';
import { KvTypography } from '@/components/shared/KvTypography';

import type { ReportFilterDef } from '../catalog/types';

type ReportsFiltersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleLabel: string;
  reportLabel: string;
  /** عنوان دیالوگ — پیش‌فرض فیلتر گزارش پایه */
  dialogTitle?: string;
  scopeHint?: string;
  filters: ReportFilterDef[];
  draft: Record<string, string>;
  onDraftChange: (key: string, value: string) => void;
  onApply: () => void;
  onReset: () => void;
};

export function ReportsFiltersDialog({
  open,
  onOpenChange,
  roleLabel,
  reportLabel,
  dialogTitle = 'فیلتر گزارش پایه',
  scopeHint,
  filters,
  draft,
  onDraftChange,
  onApply,
  onReset,
}: ReportsFiltersDialogProps) {
  return (
    <KvDialog open={open} onOpenChange={onOpenChange}>
      <KvDialogContent size="md" className="gap-kv-group">
        <KvDialogHeader>
          <KvDialogTitle>{dialogTitle}</KvDialogTitle>
          <KvDialogDescription>
            {roleLabel} · {reportLabel}
          </KvDialogDescription>
          {scopeHint ? (
            <KvTypography variant="caption" tone="muted" as="p">
              {scopeHint}
            </KvTypography>
          ) : null}
        </KvDialogHeader>

        <div className="max-h-[50dvh] space-y-kv-group overflow-y-auto pe-1">
          {filters.length === 0 ? (
            <KvTypography variant="caption" tone="muted" as="p">
              برای این نقش روی این گزارش فیلتر قابل‌تنظیم نیست؛ محدوده از scope
              نقش در سرور اعمال می‌شود.
            </KvTypography>
          ) : (
            filters.map((f) => (
              <label key={f.key} className="block space-y-kv-micro">
                <KvTypography variant="caption" weight="bold" as="span">
                  {f.label}
                </KvTypography>
                {f.type === 'select' ? (
                  <KvSelect
                    value={draft[f.key] || '__all__'}
                    onValueChange={(value) =>
                      onDraftChange(f.key, value === '__all__' ? '' : value)
                    }
                  >
                    <KvSelectTrigger aria-label={f.label}>
                      <KvSelectValue placeholder="همه" />
                    </KvSelectTrigger>
                    <KvSelectContent>
                      <KvSelectItem value="__all__">همه</KvSelectItem>
                      {(f.options ?? []).map((opt) => (
                        <KvSelectItem key={opt} value={opt}>
                          {opt}
                        </KvSelectItem>
                      ))}
                    </KvSelectContent>
                  </KvSelect>
                ) : (
                  <input
                    className="flex h-11 w-full rounded-kv-control border border-kv-border bg-kv-surface px-kv-group text-sm font-bold text-kv-text shadow-kv-raised outline-none focus-visible:border-kv-brand"
                    value={draft[f.key] ?? ''}
                    placeholder={f.label}
                    onChange={(e) => onDraftChange(f.key, e.target.value)}
                  />
                )}
              </label>
            ))
          )}
        </div>

        <KvDialogFooter>
          <KvButton
            type="button"
            appearance="secondary"
            size="md"
            disabled={!filters.length}
            onClick={onReset}
          >
            بازنشانی
          </KvButton>
          <KvButton
            type="button"
            color="cta"
            appearance="solid"
            size="md"
            disabled={!filters.length}
            onClick={onApply}
          >
            اعمال
          </KvButton>
        </KvDialogFooter>
      </KvDialogContent>
    </KvDialog>
  );
}

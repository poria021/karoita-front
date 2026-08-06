'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvSelect,
  KvSelectContent,
  KvSelectItem,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/fields/KvSelect';
import { KvTypography } from '@/components/shared/KvTypography';
import { faIcons } from '@/utils/iconMap';

type DailyApprovalsWorkspaceHeaderProps = {
  title: string;
  termId: string;
  terms: Array<{ id: string; title: string }>;
  onTermChange: (termId: string) => void;
  showBulkExtend?: boolean;
  onBulkExtendClick?: () => void;
  bulkExtendDisabled?: boolean;
};

export function DailyApprovalsWorkspaceHeader({
  title,
  termId,
  terms,
  onTermChange,
  showBulkExtend = false,
  onBulkExtendClick,
  bulkExtendDisabled = false,
}: DailyApprovalsWorkspaceHeaderProps) {
  const selectedTermId = terms.some((term) => term.id === termId)
    ? termId
    : terms[0]?.id;

  return (
    <div
      data-slot="daily-approvals-workspace-header"
      className="rounded-kv-control border border-kv-border bg-kv-surface p-kv-group shadow-kv-raised"
    >
      <div className="flex flex-col items-stretch justify-between gap-kv-group sm:flex-row sm:items-center">
        <KvTypography variant="title" weight="bold" as="h2">
          {title}
        </KvTypography>
        <div className="flex w-full flex-col items-stretch gap-kv-pair sm:w-auto sm:flex-row sm:items-center">
          {showBulkExtend ? (
            <KvButton
              type="button"
              color="violet"
              appearance="ghost"
              size="md"
              disabled={bulkExtendDisabled}
              icon={<FaIcon icon={faIcons.unlockKeyhole} size="xs" />}
              onClick={onBulkExtendClick}
            >
              تمدید گروهی مهلت ارسال گزارش
            </KvButton>
          ) : null}
          <div className="w-full shrink-0 sm:w-52">
            {selectedTermId ? (
              <KvSelect value={selectedTermId} onValueChange={onTermChange}>
                <KvSelectTrigger
                  aria-label="نیم‌سال تحصیلی"
                  className="bg-kv-surface shadow-kv-raised"
                >
                  <KvSelectValue placeholder="نیم‌سال تحصیلی" />
                </KvSelectTrigger>
                <KvSelectContent>
                  {terms.map((term) => (
                    <KvSelectItem key={term.id} value={term.id}>
                      {term.title}
                    </KvSelectItem>
                  ))}
                </KvSelectContent>
              </KvSelect>
            ) : (
              <div className="flex h-11 items-center rounded-kv-control border border-kv-border bg-kv-surface-muted px-kv-group text-xs font-bold text-kv-text-faint">
                در حال بارگذاری نیم‌سال...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

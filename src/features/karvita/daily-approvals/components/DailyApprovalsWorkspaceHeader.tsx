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
import { formatTermOptionLabel } from '@/features/karvita/syllabus-config/constants';
import {
  IS_REAL_MODE_STUB_ACTIVE,
  RealModeStubTooltip,
} from '@/components/shared/RealModeStubNotice';
import { KvFeatureIntro } from '@/components/shared/shell/KvFeatureIntro';
import { faIcons } from '@/utils/iconMap';

import { DAILY_APPROVALS_FEATURE } from '../constants';

type DailyApprovalsWorkspaceHeaderProps = {
  termId: string;
  terms: Array<{ id: string; title: string }>;
  onTermChange: (termId: string) => void;
  showBulkExtend?: boolean;
  onBulkExtendClick?: () => void;
  bulkExtendDisabled?: boolean;
};

export function DailyApprovalsWorkspaceHeader({
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
      className="border-b border-kv-border pb-kv-group"
    >
      <KvFeatureIntro
        title={DAILY_APPROVALS_FEATURE.title}
        description={DAILY_APPROVALS_FEATURE.description}
        actions={
          <>
            <div className="order-1 w-full shrink-0 lg:order-2 lg:w-52">
              {selectedTermId ? (
                <KvSelect value={selectedTermId} onValueChange={onTermChange}>
                  <KvSelectTrigger
                    aria-label="نیم‌سال تحصیلی"
                    className="bg-kv-surface !shadow-kv-raised"
                  >
                    <KvSelectValue placeholder="نیم‌سال تحصیلی" />
                  </KvSelectTrigger>
                  <KvSelectContent>
                    {terms.map((term) => (
                      <KvSelectItem key={term.id} value={term.id}>
                        {formatTermOptionLabel(term.title)}
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
            {showBulkExtend ? (
              <RealModeStubTooltip message="تمدید گروهی هنوز به API واقعی وصل نشده است.">
                <KvButton
                  type="button"
                  color="violet"
                  appearance="ghost"
                  size="md"
                  className="order-2 lg:order-1"
                  disabled={bulkExtendDisabled || IS_REAL_MODE_STUB_ACTIVE}
                  icon={<FaIcon icon={faIcons.unlockKeyhole} size="xs" />}
                  onClick={onBulkExtendClick}
                >
                  تمدید گروهی مهلت ارسال گزارش
                </KvButton>
              </RealModeStubTooltip>
            ) : null}
          </>
        }
      />
    </div>
  );
}

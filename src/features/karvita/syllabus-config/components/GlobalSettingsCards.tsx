'use client';

import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvCardTitleIcon } from '@/components/shared/KvCardTitleIcon';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
import { faIcons } from '@/utils/iconMap';
import {
  persianToEnglishDigits,
  toPersianDigits,
} from '@/utils/persianDigits';

import {
  professorCapacitySchema,
  passingThresholdSchema,
} from '../schemas/syllabus-config.schema';

interface GlobalSettingsCardsProps {
  professorCapacity: string;
  onProfessorCapacityChange: (value: string) => void;
  onSaveProfessorCapacity: () => void;
  passingThreshold: string;
  onPassingThresholdChange: (value: string) => void;
  onSavePassingThreshold: () => void;
}

function normalizeDigitsOnly(raw: string): string {
  return persianToEnglishDigits(raw).replace(/[^\d]/g, '');
}

export function GlobalSettingsCards({
  professorCapacity,
  onProfessorCapacityChange,
  onSaveProfessorCapacity,
  passingThreshold,
  onPassingThresholdChange,
  onSavePassingThreshold,
}: GlobalSettingsCardsProps) {
  const capacityInvalid = !professorCapacitySchema.safeParse({
    capacity: professorCapacity,
  }).success;
  const thresholdInvalid = !passingThresholdSchema.safeParse({
    threshold: passingThreshold,
  }).success;

  return (
    <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2 lg:grid-cols-1">
      <SettingsMetricCard
        icon={faIcons.userGroup}
        title="سقف عمومی ظرفیت اساتید"
        description="سهمیه عددی پایه تخصیص‌یافته به دروس"
        value={professorCapacity}
        displayValue={toPersianDigits(professorCapacity)}
        onValueChange={(raw) =>
          onProfessorCapacityChange(normalizeDigitsOnly(raw))
        }
        onSave={onSaveProfessorCapacity}
        saveLabel="ذخیره ظرفیت"
        disabled={capacityInvalid}
      />

      <SettingsMetricCard
        icon={faIcons.graduationCap}
        title="حد نصاب قبولی سیستم (از ۱۰۰)"
        description="تعیین حداقل نمره عددی لازم برای قبولی در گزارش‌ها"
        value={passingThreshold}
        displayValue={toPersianDigits(passingThreshold)}
        onValueChange={(raw) =>
          onPassingThresholdChange(normalizeDigitsOnly(raw))
        }
        onSave={onSavePassingThreshold}
        saveLabel="ذخیره نمره"
        disabled={thresholdInvalid}
      />
    </div>
  );
}

function SettingsMetricCard({
  icon,
  title,
  description,
  value,
  displayValue,
  onValueChange,
  onSave,
  saveLabel,
  disabled,
}: {
  icon: typeof faIcons.userGroup;
  title: string;
  description: string;
  value: string;
  displayValue: string;
  onValueChange: (raw: string) => void;
  onSave: () => void;
  saveLabel: string;
  disabled: boolean;
}) {
  return (
    <KvCard>
      <KvCardContent padding="md" className="space-y-kv-group">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-kv-pair">
            <KvCardTitleIcon icon={icon} />
            <div className="min-w-0">
              <KvTypography variant="subtitle" as="h4">
                {title}
              </KvTypography>
              <KvTypography variant="caption" tone="muted">
                {description}
              </KvTypography>
            </div>
          </div>
          <div className="w-28 shrink-0">
            <KvTextField
              label={false}
              size="md"
              inputMode="numeric"
              dir="ltr"
              value={displayValue}
              onChange={(event) => onValueChange(event.target.value)}
            />
            <span className="sr-only">{value}</span>
          </div>
        </div>

        <div className="flex flex-col border-t border-kv-border-muted pt-kv-group sm:flex-row sm:justify-end">
          <KvButton
            type="button"
            color="cta"
            appearance="solid"
            size="sm"
            className="w-full sm:w-auto"
            disabled={disabled}
            onClick={onSave}
          >
            {saveLabel}
          </KvButton>
        </div>
      </KvCardContent>
    </KvCard>
  );
}

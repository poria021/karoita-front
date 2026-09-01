'use client';

import { useEffect, useState } from 'react';

import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvCardTitleIcon } from '@/components/shared/KvCardTitleIcon';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
import { Spinner } from '@/components/ui/spinner';
import { faIcons } from '@/utils/iconMap';
import { persianToEnglishDigits } from '@/utils/persianDigits';

import {
  professorCapacitySchema,
  passingThresholdSchema,
} from '../schemas/syllabus-config.schema';

interface GlobalSettingsCardsProps {
  professorCapacity: string;
  onProfessorCapacityChange: (value: string) => void;
  onSaveProfessorCapacity: () => void | Promise<boolean>;
  passingThreshold: string;
  onPassingThresholdChange: (value: string) => void;
  onSavePassingThreshold: () => void | Promise<boolean>;
  isLoading?: boolean;
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
  isLoading = false,
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
        value={professorCapacity}
        onValueChange={(raw) =>
          onProfessorCapacityChange(normalizeDigitsOnly(raw))
        }
        onSave={onSaveProfessorCapacity}
        saveLabel="ذخیره ظرفیت"
        invalid={capacityInvalid}
        isLoading={isLoading}
      />

      <SettingsMetricCard
        icon={faIcons.graduationCap}
        title="حد نصاب قبولی سیستم (از ۱۰۰)"
        value={passingThreshold}
        onValueChange={(raw) =>
          onPassingThresholdChange(normalizeDigitsOnly(raw))
        }
        onSave={onSavePassingThreshold}
        saveLabel="ذخیره نمره"
        invalid={thresholdInvalid}
        isLoading={isLoading}
      />
    </div>
  );
}

function SettingsMetricCard({
  icon,
  title,
  value,
  onValueChange,
  onSave,
  saveLabel,
  invalid,
  isLoading,
}: {
  icon: typeof faIcons.userGroup;
  title: string;
  value: string;
  onValueChange: (raw: string) => void;
  onSave: () => void | Promise<boolean>;
  saveLabel: string;
  invalid: boolean;
  isLoading?: boolean;
}) {
  const [committed, setCommitted] = useState(value);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setTouched(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!touched) {
      setCommitted(value);
    }
  }, [value, touched]);

  const isDirty = touched && value !== committed;

  return (
    <KvCard>
      <KvCardContent padding="md" className="space-y-kv-group">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-kv-pair">
            <KvCardTitleIcon icon={icon} />
            <div className="min-w-0">
              <KvTypography variant="subtitle" weight="black" as="h4">
                {title}
              </KvTypography>
            </div>
          </div>
          <div className="flex w-28 shrink-0 items-center justify-center">
            {isLoading ? (
              <span
                className="inline-flex h-11 w-full items-center justify-center"
                role="status"
                aria-label={`در حال دریافت ${title}`}
              >
                <Spinner className="size-4 text-kv-brand" aria-hidden="true" />
              </span>
            ) : (
              <KvTextField
                label={false}
                size="md"
                type="number"
                inputMode="numeric"
                dir="ltr"
                scriptGuard="none"
                value={value}
                onChange={(event) => {
                  setTouched(true);
                  onValueChange(event.target.value);
                }}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col border-t border-kv-border-muted pt-kv-group sm:flex-row sm:justify-end">
          <KvButton
            type="button"
            color="cta"
            appearance="solid"
            size="sm"
            className="w-full sm:w-auto"
            disabled={invalid || isLoading || !isDirty}
            onClick={() => {
              void Promise.resolve(onSave()).then((ok) => {
                if (ok !== false) {
                  setTouched(false);
                }
              });
            }}
          >
            {saveLabel}
          </KvButton>
        </div>
      </KvCardContent>
    </KvCard>
  );
}

'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import { Badge } from '@/components/ui/badge';
import type { InternshipSupervisor } from '@/types/internship-enrollment';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

type SupervisorSelectionMobileListProps = {
  supervisors: InternshipSupervisor[];
  isLoading: boolean;
  submittingId: string | null;
  onEnroll: (supervisorId: string) => void;
};

function capacityLabel(capacity: InternshipSupervisor['capacity']): string {
  return capacity === null ? 'نامحدود' : `${toPersianDigits(capacity)} نفر`;
}

export function SupervisorSelectionMobileList({
  supervisors,
  isLoading,
  submittingId,
  onEnroll,
}: SupervisorSelectionMobileListProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-kv-pair lg:hidden">
      {isLoading ? (
        <KvBusySurface className="min-h-48 rounded-kv-card bg-kv-surface-subtle" />
      ) : supervisors.length === 0 ? (
        <div className="flex min-h-48 flex-1 rounded-kv-card border border-dashed border-kv-border bg-kv-surface-subtle">
          <KvEmptyState
            title="استاد راهنمای در دسترس یافت نشد"
            description="هیچ استادی دارای ظرفیت مجاز در حوزه انتخابی شما یافت نشد."
          />
        </div>
      ) : (
        supervisors.map((supervisor) => (
          <KvCard
            key={supervisor.id}
            padding="md"
            className="space-y-kv-group bg-kv-surface-subtle text-start"
          >
            <div className="flex items-start justify-between gap-kv-inline">
              <div className="min-w-0 space-y-kv-pair">
                <KvTypography variant="subtitle" as="h3" truncate>
                  {supervisor.name}
                </KvTypography>
                <KvTypography variant="caption" tone="muted" as="p" truncate>
                  {supervisor.college}
                </KvTypography>
              </div>
              <Badge variant="brand">{supervisor.day}</Badge>
            </div>

            <div className="flex items-center justify-between gap-kv-inline border-t border-dashed border-kv-border pt-kv-field">
              <KvTypography variant="caption" tone="muted" as="span">
                استان تابعه: {supervisor.province}
              </KvTypography>
              <KvTypography variant="label" tone="brand" as="span">
                {capacityLabel(supervisor.capacity)}
              </KvTypography>
            </div>

            <KvButton
              type="button"
              color="cta"
              appearance="solid"
              className="w-full"
              loading={submittingId === supervisor.id}
              disabled={submittingId !== null}
              onClick={() => onEnroll(supervisor.id)}
              icon={<FaIcon icon={faIcons.check} size="xs" />}
              iconPosition="start"
            >
              ثبت‌نام و اخذ واحد با این استاد
            </KvButton>
          </KvCard>
        ))
      )}
    </div>
  );
}

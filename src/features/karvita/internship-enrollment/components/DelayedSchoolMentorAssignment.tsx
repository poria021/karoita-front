'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { KvSearchField } from '@/components/shared/fields/KvSearchField';
import { KvTypography } from '@/components/shared/KvTypography';
import { useDelayedSchoolMentorAssignment } from '@/features/karvita/internship-enrollment/hooks/useDelayedSchoolMentorAssignment';
import type {
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
  InternshipMentorCapacity,
  InternshipSchoolCapacity,
} from '@/types/internship-enrollment';
import { faIcons } from '@/utils/iconMap';

type DelayedSchoolMentorAssignmentProps = {
  actor: InternshipEnrollmentActor;
  state: InternshipEnrollmentPageState;
  supervisorName: string;
  disabled: boolean;
  onAssignmentComplete: () => Promise<void>;
};

type AssignmentOptionListProps<T extends { id: string; name: string }> = {
  items: T[];
  isLoading: boolean;
  emptyLabel: string;
  disabled?: boolean;
  onSelect: (item: T) => void;
};

function AssignmentOptionList<T extends { id: string; name: string }>({
  items,
  isLoading,
  emptyLabel,
  disabled = false,
  onSelect,
}: AssignmentOptionListProps<T>) {
  if (isLoading) {
    return (
      <KvTypography variant="caption" tone="muted" as="p">
        در حال بارگذاری...
      </KvTypography>
    );
  }

  if (items.length === 0) {
    return (
      <KvTypography variant="caption" tone="muted" as="p">
        {emptyLabel}
      </KvTypography>
    );
  }

  return (
    <div
      className="max-h-36 overflow-y-auto rounded-kv-panel border border-kv-border bg-kv-surface"
      role="listbox"
    >
      {items.map((item) => (
        <KvButton
          key={item.id}
          type="button"
          color="neutral"
          appearance="text"
          size="sm"
          fullWidth
          className="justify-start rounded-none px-kv-field text-start"
          disabled={disabled}
          onClick={() => onSelect(item)}
        >
          {item.name}
        </KvButton>
      ))}
    </div>
  );
}

export function DelayedSchoolMentorAssignment({
  actor,
  state,
  supervisorName,
  disabled,
  onAssignmentComplete,
}: DelayedSchoolMentorAssignmentProps) {
  const assignment = useDelayedSchoolMentorAssignment({
    actor,
    state,
    onAssignmentComplete,
  });

  return (
    <KvCard
      padding="md"
      tone="muted"
      className="border border-dashed border-kv-brand/40"
    >
      <div className="space-y-kv-group">
        <div className="flex flex-wrap items-center justify-between gap-kv-pair border-b border-kv-border pb-kv-field">
          <div className="flex items-center gap-kv-inline">
            <FaIcon icon={faIcons.school} size="sm" className="text-kv-brand" />
            <KvTypography variant="subtitle" as="h3">
              تکمیل تخصیص محل کارورزی
            </KvTypography>
          </div>
          <KvTypography variant="caption" tone="muted" as="span">
            استاد راهنما: {supervisorName}
          </KvTypography>
        </div>

        <div className="grid gap-kv-group lg:grid-cols-2">
          <div className="space-y-kv-pair">
            <KvSearchField
              label="مدرسه همکار"
              placeholder="جستجوی نام مدرسه..."
              value={assignment.schoolQuery}
              locked={disabled}
              onChange={(event) => assignment.setSchoolSearch(event.target.value)}
            />
            <AssignmentOptionList<InternshipSchoolCapacity>
              items={assignment.schools}
              isLoading={assignment.isLoadingSchools}
              emptyLabel="مدرسه‌ای در حوزهٔ شما یافت نشد."
              disabled={disabled}
              onSelect={assignment.selectSchool}
            />
          </div>

          <div className="space-y-kv-pair">
            <KvSearchField
              label="معلم ناظر"
              placeholder="جستجوی نام مربی..."
              value={assignment.mentorQuery}
              locked={disabled || !assignment.selectedSchool}
              onChange={(event) => assignment.setMentorSearch(event.target.value)}
            />
            {assignment.selectedSchool ? (
              <AssignmentOptionList<InternshipMentorCapacity>
                items={assignment.mentors}
                isLoading={assignment.isLoadingMentors}
                emptyLabel="معلم ناظری برای این مدرسه یافت نشد."
                disabled={disabled}
                onSelect={assignment.selectMentor}
              />
            ) : (
              <KvTypography variant="caption" tone="muted" as="p">
                ابتدا مدرسه همکار را انتخاب کنید.
              </KvTypography>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <KvButton
            type="button"
            color="cta"
            size="md"
            loading={assignment.isSubmitting}
            disabled={
              disabled ||
              !assignment.selectedSchool ||
              !assignment.selectedMentor
            }
            icon={<FaIcon icon={faIcons.check} size="sm" />}
            onClick={() => void assignment.submit()}
          >
            ثبت نهایی و تخصیص مدرسه همکار
          </KvButton>
        </div>
      </div>
    </KvCard>
  );
}

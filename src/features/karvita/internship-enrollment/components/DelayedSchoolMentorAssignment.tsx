'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { useDelayedSchoolMentorAssignment } from '@/features/karvita/internship-enrollment/hooks/useDelayedSchoolMentorAssignment';
import type {
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
} from '@/types/internship-enrollment';
import { faIcons } from '@/utils/iconMap';

type DelayedSchoolMentorAssignmentProps = {
  actor: InternshipEnrollmentActor;
  state: InternshipEnrollmentPageState;
  supervisorName: string;
  disabled: boolean;
  onAssignmentComplete: () => Promise<void>;
};

type ComboboxDropdownProps = {
  open: boolean;
  isLoading: boolean;
  emptyLabel: string;
  items: Array<{ id: string; name: string }>;
  onSelect: (id: string) => void;
};

function ComboboxDropdown({
  open,
  isLoading,
  emptyLabel,
  items,
  onSelect,
}: ComboboxDropdownProps) {
  if (!open) return null;

  return (
    <div
      className="absolute end-0 top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-kv-panel border border-kv-border bg-kv-surface shadow-kv-overlay"
      role="listbox"
    >
      {isLoading ? (
        <p className="px-kv-group py-kv-pair text-start text-xs font-bold text-kv-text-faint">
          در حال بارگذاری...
        </p>
      ) : items.length === 0 ? (
        <p className="px-kv-group py-kv-pair text-start text-xs font-bold text-kv-text-faint">
          {emptyLabel}
        </p>
      ) : (
        items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="option"
            className="w-full border-b border-kv-border px-kv-group py-kv-pair text-start text-xs font-bold text-kv-text-secondary transition-colors last:border-0 enabled:hover:bg-kv-surface-muted"
            onClick={() => onSelect(item.id)}
          >
            {item.name}
          </button>
        ))
      )}
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
  const schoolFieldId = useId();
  const mentorFieldId = useId();
  const schoolWrapRef = useRef<HTMLDivElement>(null);
  const mentorWrapRef = useRef<HTMLDivElement>(null);
  const validateSchoolRef = useRef(assignment.validateSchoolSelection);
  const validateMentorRef = useRef(assignment.validateMentorSelection);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [mentorOpen, setMentorOpen] = useState(false);
  const mentorLocked = disabled || !assignment.selectedSchool;

  validateSchoolRef.current = assignment.validateSchoolSelection;
  validateMentorRef.current = assignment.validateMentorSelection;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        schoolWrapRef.current &&
        !schoolWrapRef.current.contains(target)
      ) {
        setSchoolOpen(false);
        validateSchoolRef.current();
      }
      if (
        mentorWrapRef.current &&
        !mentorWrapRef.current.contains(target)
      ) {
        setMentorOpen(false);
        validateMentorRef.current();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  return (
    <fieldset
      disabled={disabled}
      className="mt-kv-pair flex w-full flex-col rounded-kv-card border border-dashed border-kv-brand-border bg-kv-brand-soft/70 p-kv-group shadow-kv-raised lg:max-w-[750px]"
    >
      <div className="mb-kv-group w-full border-b border-kv-brand/20 pb-kv-group">
        <div className="flex w-full flex-col items-stretch gap-kv-inline text-xs text-kv-text-secondary lg:flex-row lg:items-center">
          <div className="flex w-full shrink-0 items-center justify-between border-b border-kv-border pb-kv-pair font-medium select-none lg:w-auto lg:justify-start lg:border-b-0 lg:pb-0">
            <span>استاد راهنما:</span>
            <strong className="ms-kv-pair rounded-kv-control border border-kv-border bg-kv-surface-muted px-2 py-0.5 text-xs font-bold text-kv-text">
              {supervisorName}
            </strong>
          </div>

          <div
            ref={schoolWrapRef}
            className="relative z-40 flex w-full flex-col items-start sm:flex-row sm:items-center lg:flex-1"
          >
            <label
              htmlFor={schoolFieldId}
              className="mb-1 shrink-0 font-bold sm:mb-0 sm:me-kv-pair"
            >
              مدرسه همکار:
            </label>
            <div
              className={`relative flex h-9 w-full items-center rounded-kv-control border bg-kv-surface transition-all focus-within:border-kv-brand ${
                schoolOpen ? 'border-kv-brand' : 'border-kv-border'
              }`}
            >
              <input
                id={schoolFieldId}
                type="text"
                disabled={disabled}
                value={assignment.schoolQuery}
                placeholder="جستجوی نام مدرسه..."
                autoComplete="off"
                className="h-full w-full bg-transparent px-kv-group text-start text-xs font-medium text-kv-text outline-none placeholder:text-kv-text-faint disabled:cursor-not-allowed"
                onFocus={() => {
                  setSchoolOpen(true);
                  setMentorOpen(false);
                  assignment.beginSchoolPick();
                }}
                onChange={(event) => {
                  setSchoolOpen(true);
                  assignment.setSchoolSearch(event.target.value);
                }}
              />
              <span className="pointer-events-none pe-kv-pair text-kv-text-faint">
                <FaIcon icon={faIcons.chevronDown} size="2xs" />
              </span>
            </div>
            <ComboboxDropdown
              open={schoolOpen}
              isLoading={assignment.isLoadingSchools}
              emptyLabel="مدرسه‌ای در حوزهٔ شما یافت نشد."
              items={assignment.schools}
              onSelect={(id) => {
                const school = assignment.schools.find((item) => item.id === id);
                if (!school) return;
                assignment.selectSchool(school);
                setSchoolOpen(false);
                setMentorOpen(false);
              }}
            />
          </div>

          <div
            ref={mentorWrapRef}
            className="relative z-30 flex w-full flex-col items-start sm:flex-row sm:items-center lg:flex-1"
          >
            <label
              htmlFor={mentorFieldId}
              className="mb-1 shrink-0 font-bold sm:mb-0 sm:me-kv-pair"
            >
              معلم ناظر:
            </label>
            <div
              className={`relative flex h-9 w-full items-center rounded-kv-control border transition-all ${
                mentorLocked
                  ? 'cursor-not-allowed border-kv-border bg-kv-surface-muted/50 opacity-60'
                  : `bg-kv-surface focus-within:border-kv-brand ${
                      mentorOpen ? 'border-kv-brand' : 'border-kv-border'
                    }`
              }`}
            >
              <input
                id={mentorFieldId}
                type="text"
                disabled={mentorLocked}
                value={assignment.mentorQuery}
                placeholder="جستجوی نام مربی..."
                autoComplete="off"
                className="h-full w-full bg-transparent px-kv-group text-start text-xs font-medium text-kv-text outline-none placeholder:text-kv-text-faint disabled:cursor-not-allowed"
                onFocus={() => {
                  if (mentorLocked) return;
                  setMentorOpen(true);
                  setSchoolOpen(false);
                }}
                onChange={(event) => {
                  if (mentorLocked) return;
                  setMentorOpen(true);
                  assignment.setMentorSearch(event.target.value);
                }}
              />
              <span className="pointer-events-none pe-kv-pair text-kv-text-faint">
                <FaIcon icon={faIcons.chevronDown} size="2xs" />
              </span>
            </div>
            <ComboboxDropdown
              open={mentorOpen && Boolean(assignment.selectedSchool)}
              isLoading={assignment.isLoadingMentors}
              emptyLabel="معلم ناظری برای این مدرسه یافت نشد."
              items={assignment.mentors}
              onSelect={(id) => {
                const mentor = assignment.mentors.find((item) => item.id === id);
                if (!mentor) return;
                assignment.selectMentor(mentor);
                setMentorOpen(false);
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex w-full justify-end">
        <KvButton
          type="button"
          color="cta"
          appearance="solid"
          size="sm"
          fullWidth
          className="sm:w-auto"
          loading={assignment.isSubmitting}
          disabled={
            disabled ||
            !assignment.selectedSchool ||
            !assignment.selectedMentor
          }
          icon={<FaIcon icon={faIcons.link} size="2xs" />}
          onClick={() => void assignment.submit()}
        >
          ثبت نهایی و تخصیص مدرسه همکار
        </KvButton>
      </div>
    </fieldset>
  );
}

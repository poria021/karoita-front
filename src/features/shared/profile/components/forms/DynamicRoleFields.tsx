'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import { KvFormField } from '@/components/shared/fields/KvForm';
import { KvSearchableOrganizationSelect } from '@/components/shared/fields/KvSearchableOrganizationSelect';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import type { UserRole } from '@/types/auth';
import {
  persianToEnglishDigits,
  toPersianDigits,
} from '@/utils/persianDigits';

import type { ProfileSchema } from '@/services/profile/profile.schema';
import {
  DEPENDENCIES,
  getIdentifierMeta,
  isOptionalOrganizationField,
  ORGANIZATION_LABELS,
  ROLE_FIELD_STRATEGY,
} from './profile-form-options';
import type { OrganizationField } from './profile-form-options';

export interface DynamicRoleFieldsProps {
  role: UserRole;
  section: 'identifiers' | 'organization';
  organizationLocked?: boolean;
  identifierLocked?: boolean;
}

function filterDigits(rawValue: string): string {
  return persianToEnglishDigits(rawValue).replace(/\D/g, '');
}

/** این فیلدها می‌توانند بیش از یک مقدار داشته باشند (چندانتخابی با چیپ). */
const MULTI_ORGANIZATION_FIELDS = new Set<OrganizationField>([
  'province',
  'city',
  'district',
  'college',
  'school',
]);

/** برای این نقش‌ها، province و college تک‌انتخابی هستند. */
const SINGLE_SELECT_ROLES = new Set<UserRole>(['student', 'skill_learner']);

function isMultiField(role: UserRole, name: OrganizationField): boolean {
  if (SINGLE_SELECT_ROLES.has(role) && (name === 'province' || name === 'college')) {
    return false;
  }
  return MULTI_ORGANIZATION_FIELDS.has(name);
}

function getEmptyValue(role: UserRole, field: OrganizationField): string | string[] {
  if (SINGLE_SELECT_ROLES.has(role) && (field === 'province' || field === 'college')) {
    return '';
  }
  return [];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

/**
 * dependsOn مناسب برای هر فیلد را برمی‌گرداند.
 * فقط اطلاعاتی که API واقعاً برای فیلتر نیاز دارد پاس می‌شود.
 */
function getDependsOn(
  name: OrganizationField,
  province: string[],
  city: string[],
  district: string[]
): { province?: string[]; city?: string[]; district?: string[] } | undefined {
  switch (name) {
    case 'city':
      return { province };
    case 'district':
      return { province, city };
    case 'school':
      return { province, city, district };
    case 'college':
      return { province };
    default:
      return undefined;
  }
}

function RoleOrganizationSelect({
  name,
  role,
  locked,
  dependsOn,
}: {
  name: OrganizationField;
  role: UserRole;
  locked: boolean;
  dependsOn?: { province?: string[]; city?: string[]; district?: string[] };
}) {
  const form = useFormContext<ProfileSchema>();
  const optional = isOptionalOrganizationField(role, name);
  const isMulti = isMultiField(role, name);

  return (
    <KvFormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) =>
        isMulti ? (
          <KvSearchableOrganizationSelect
            ref={field.ref}
            multi
            type={name}
            label={ORGANIZATION_LABELS[name]}
            required={!optional}
            optionalHint={optional}
            value={asStringArray(field.value)}
            placeholder={`جستجو و انتخاب ${ORGANIZATION_LABELS[name]}...`}
            locked={locked}
            showLockIcon={false}
            error={fieldState.error?.message}
            dependsOn={dependsOn}
            role={role}
            onChange={(next) => {
              field.onChange(next);
              for (const dependent of DEPENDENCIES[name] ?? []) {
                form.setValue(dependent, getEmptyValue(role, dependent), {
                  shouldDirty: true,
                  shouldValidate: false,
                });
              }
            }}
          />
        ) : (
          <KvSearchableOrganizationSelect
            ref={field.ref}
            type={name}
            label={ORGANIZATION_LABELS[name]}
            required={!optional}
            optionalHint={optional}
            value={typeof field.value === 'string' ? field.value : ''}
            placeholder={`جستجو و انتخاب ${ORGANIZATION_LABELS[name]}...`}
            locked={locked}
            showLockIcon={false}
            error={fieldState.error?.message}
            dependsOn={dependsOn}
            role={role}
            onChange={(value) => {
              field.onChange(value);
              for (const dependent of DEPENDENCIES[name] ?? []) {
                form.setValue(dependent, getEmptyValue(role, dependent), {
                  shouldDirty: true,
                  shouldValidate: false,
                });
              }
            }}
          />
        )
      }
    />
  );
}

export function DynamicRoleFields({
  role,
  section,
  organizationLocked = false,
  identifierLocked = false,
}: DynamicRoleFieldsProps) {
  const form = useFormContext<ProfileSchema>();
  const strategy = ROLE_FIELD_STRATEGY[role];
  const hasMajor = strategy.organizationFields.includes('major');
  const locationFields = strategy.organizationFields.filter(
    (name) => name !== 'major'
  );

  const rawProvince = useWatch({
    control: form.control,
    name: 'province',
    disabled: section !== 'organization',
  });
  const province =
    typeof rawProvince === 'string'
      ? rawProvince ? [rawProvince] : []
      : asStringArray(rawProvince);
  const city = asStringArray(
    useWatch({
      control: form.control,
      name: 'city',
      disabled: section !== 'organization',
    })
  );
  const district = asStringArray(
    useWatch({
      control: form.control,
      name: 'district',
      disabled: section !== 'organization',
    })
  );

  if (section === 'identifiers') {
    return (
      <>
        {strategy.identifierFields.map((name) => {
          const meta = getIdentifierMeta(role, name);
          return (
            <KvFormField
              key={name}
              control={form.control}
              name={name}
              render={({ field, fieldState }) => (
                <KvTextField
                  label={meta.label}
                  required
                  type="tel"
                  inputMode="numeric"
                  dir="ltr"
                  locked={identifierLocked}
                  placeholder={meta.placeholder}
                  error={fieldState.error?.message}
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={toPersianDigits(
                    typeof field.value === 'string' ? field.value : ''
                  )}
                  onChange={(event) => {
                    field.onChange(filterDigits(event.target.value));
                  }}
                />
              )}
            />
          );
        })}
        {hasMajor ? (
          <RoleOrganizationSelect
            name="major"
            role={role}
            locked={identifierLocked}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      {locationFields.map((name) => (
        <RoleOrganizationSelect
          key={name}
          name={name}
          role={role}
          locked={organizationLocked}
          dependsOn={getDependsOn(name, province, city, district)}
        />
      ))}
    </>
  );
}

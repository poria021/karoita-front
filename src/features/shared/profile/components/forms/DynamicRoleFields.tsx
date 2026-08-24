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
  type OrganizationField,
} from './profile-form-options';

export interface DynamicRoleFieldsProps {
  role: UserRole;
  disabled?: boolean;
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

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

/**
 * تعیین می‌کند که آیا یک فیلد در این لحظه باید قفل باشد.
 * اگر فیلد والد خالی باشد، فیلد فرزند قفل می‌شود.
 */
function isLockedByParent(
  name: OrganizationField,
  province: string[],
  district: string[]
): boolean {
  switch (name) {
    case 'city':
      return province.length === 0;
    case 'district':
      return province.length === 0;
    case 'school':
      return district.length === 0;
    case 'college':
      return province.length === 0;
    default:
      return false;
  }
}

/**
 * dependsOn مناسب برای هر فیلد را برمی‌گرداند.
 * فقط اطلاعاتی که API واقعاً برای فیلتر نیاز دارد پاس می‌شود.
 */
function getDependsOn(
  name: OrganizationField,
  province: string[],
  district: string[]
): { province?: string[]; district?: string[] } | undefined {
  switch (name) {
    case 'city':
      return { province };
    case 'district':
      return { province };
    case 'school':
      return { district };
    default:
      return undefined;
  }
}

export function DynamicRoleFields({
  role,
  disabled = false,
}: DynamicRoleFieldsProps) {
  const form = useFormContext<ProfileSchema>();

  // watch فیلدهای والد برای cascade lock و cascade clear
  const province = asStringArray(
    useWatch({ control: form.control, name: 'province' })
  );
  const district = asStringArray(
    useWatch({ control: form.control, name: 'district' })
  );

  const strategy = ROLE_FIELD_STRATEGY[role];

  return (
    <>
      {strategy.organizationFields.map((name) => {
        const optional = isOptionalOrganizationField(role, name);
        const isMulti = MULTI_ORGANIZATION_FIELDS.has(name);
        const parentLocked = isLockedByParent(name, province, district);
        const fieldLocked = disabled || parentLocked;
        const dependsOn = getDependsOn(name, province, district);

        return (
          <KvFormField
            key={name}
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
                  locked={fieldLocked}
                  showLockIcon={!disabled && parentLocked}
                  error={fieldState.error?.message}
                  dependsOn={dependsOn}
                  onChange={(next) => {
                    field.onChange(next);
                    // پاک کردن آبشاری فیلدهای وابسته
                    for (const dependent of DEPENDENCIES[name] ?? []) {
                      form.setValue(dependent, [], {
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
                  locked={fieldLocked}
                  showLockIcon={!disabled && parentLocked}
                  error={fieldState.error?.message}
                  dependsOn={dependsOn}
                  onChange={(value) => field.onChange(value)}
                />
              )
            }
          />
        );
      })}

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
                locked={disabled}
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
    </>
  );
}

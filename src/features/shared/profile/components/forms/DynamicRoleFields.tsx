'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import { KvFormField } from '@/components/shared/fields/KvForm';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import type { UserRole } from '@/types/auth';
import {
  persianToEnglishDigits,
  toPersianDigits,
} from '@/utils/persianDigits';

import type { ProfileSchema } from '../../schemas/profile.schema';
import {
  DEPENDENCIES,
  getIdentifierMeta,
  isOptionalOrganizationField,
  ORGANIZATION_LABELS,
  ROLE_FIELD_STRATEGY,
} from './profile-form-options';
import { SearchableOrganizationSelect } from './SearchableOrganizationSelect';

export interface DynamicRoleFieldsProps {
  role: UserRole;
  disabled?: boolean;
}

/** Normalize to English digits-only for RHF / Zod / API. */
function filterDigits(rawValue: string): string {
  return persianToEnglishDigits(rawValue).replace(/\D/g, '');
}

/** Role-strategy-driven fields — all labeled via KvTextField / select shell. */
export function DynamicRoleFields({
  role,
  disabled = false,
}: DynamicRoleFieldsProps) {
  const form = useFormContext<ProfileSchema>();
  const province = useWatch({ control: form.control, name: 'province' }) ?? '';
  const district = useWatch({ control: form.control, name: 'district' }) ?? '';
  const strategy = ROLE_FIELD_STRATEGY[role];

  return (
    <>
      {strategy.organizationFields.map((name) => {
        const optional = isOptionalOrganizationField(role, name);

        return (
          <KvFormField
            key={name}
            control={form.control}
            name={name}
            render={({ field, fieldState }) => (
              <SearchableOrganizationSelect
                type={name}
                label={ORGANIZATION_LABELS[name]}
                required={!optional}
                optionalHint={optional}
                value={typeof field.value === 'string' ? field.value : ''}
                placeholder={`جستجو و انتخاب ${ORGANIZATION_LABELS[name]}...`}
                locked={disabled}
                error={fieldState.error?.message}
                dependsOn={{
                  province:
                    typeof province === 'string' ? province : undefined,
                  district:
                    typeof district === 'string' ? district : undefined,
                }}
                onChange={(value) => {
                  field.onChange(value);
                  for (const dependent of DEPENDENCIES[name] ?? []) {
                    form.setValue(dependent, '', {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                }}
              />
            )}
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

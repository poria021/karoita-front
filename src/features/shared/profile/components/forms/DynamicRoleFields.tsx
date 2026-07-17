'use client';

import type { ChangeEvent } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { KvFormField } from '@/components/shared/KvForm';
import { KvTextField } from '@/components/shared/KvTextField';
import type { UserRole } from '@/types/auth';
import { persianToEnglishDigits } from '@/utils/persianDigits';

import type { ProfileSchema } from '../../schemas/profile.schema';
import {
  DEPENDENCIES,
  IDENTIFIER_META,
  isOptionalOrganizationField,
  ORGANIZATION_LABELS,
  ROLE_FIELD_STRATEGY,
} from './profile-form-options';
import { SearchableOrganizationSelect } from './SearchableOrganizationSelect';

export interface DynamicRoleFieldsProps {
  role: UserRole;
  disabled?: boolean;
}

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
                showLockIcon={disabled}
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
        const errors = form.formState.errors as Record<
          string,
          { message?: unknown } | undefined
        >;
        const error = errors[name]?.message;
        const registration = form.register(name);

        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
          event.target.value = filterDigits(event.target.value);
          void registration.onChange(event);
        };

        return (
          <KvTextField
            key={name}
            label={IDENTIFIER_META[name].label}
            required
            type="tel"
            inputMode="numeric"
            locked={disabled}
            showLockIcon={disabled}
            placeholder={IDENTIFIER_META[name].placeholder}
            error={typeof error === 'string' ? error : undefined}
            name={registration.name}
            onBlur={registration.onBlur}
            ref={registration.ref}
            onChange={handleChange}
          />
        );
      })}
    </>
  );
}

'use client';

import { Lock } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';

import {
  KvFormField,
  KvFormItem,
  KvFormLabel,
} from '@/components/shared/KvForm';
import { KvTextField } from '@/components/shared/KvTextField';
import type { UserRole } from '@/types/auth';

import type { ProfileSchema } from '../../schemas/profile.schema';
import {
  DEPENDENCIES,
  getOrganizationOptions,
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

/** Role-strategy-driven fields for the polymorphic profile schema. */
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
              <KvFormItem>
                <KvFormLabel
                  className="inline-flex items-center gap-1.5"
                  dir="rtl"
                >
                  {disabled ? (
                    <Lock
                      className="size-3.5 shrink-0 text-slate-400"
                      aria-hidden="true"
                    />
                  ) : null}
                  {ORGANIZATION_LABELS[name]}
                  {optional ? (
                    <span className="ms-1 font-normal text-slate-400">
                      (اختیاری)
                    </span>
                  ) : (
                    <span className="ms-1 text-rose-500">*</span>
                  )}
                </KvFormLabel>
                <SearchableOrganizationSelect
                  value={typeof field.value === 'string' ? field.value : ''}
                  options={getOrganizationOptions(name, province, district)}
                  placeholder={`جستجو و انتخاب ${ORGANIZATION_LABELS[name]}...`}
                  locked={disabled}
                  error={fieldState.error?.message}
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
              </KvFormItem>
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

        return (
          <KvTextField
            key={name}
            label={IDENTIFIER_META[name].label}
            required
            inputMode="numeric"
            locked={disabled}
            showLockIcon={disabled}
            placeholder={IDENTIFIER_META[name].placeholder}
            error={typeof error === 'string' ? error : undefined}
            {...form.register(name)}
          />
        );
      })}
    </>
  );
}

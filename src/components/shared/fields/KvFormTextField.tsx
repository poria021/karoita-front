'use client';

import type {
  Control,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import { KvFormField } from '@/components/shared/fields/KvForm';

import {
  KvTextField,
  type KvTextFieldProps,
} from '@/components/shared/fields/KvTextField';

type KvFormTextFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
} & Omit<
  KvTextFieldProps,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'error' | 'id'
>;

export function KvFormTextField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  ...fieldProps
}: KvFormTextFieldProps<TFieldValues, TName>) {
  return (
    <KvFormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <KvTextField
          {...fieldProps}
          name={field.name}
          value={
            typeof field.value === 'string' || typeof field.value === 'number'
              ? String(field.value)
              : ''
          }
          onChange={field.onChange}
          onBlur={field.onBlur}
          ref={field.ref}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

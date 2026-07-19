import { Controller, type Control } from 'react-hook-form';

import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';

import {
  REGISTER_ROLE_LABELS,
  SELF_REGISTERABLE_ROLES,
  type RegisterSchema,
} from '../../schemas/auth.schema';

interface RoleSelectFieldProps {
  control: Control<RegisterSchema>;
  errorMessage?: string;
  disabled?: boolean;
}

/** Self-service role selector — labeled via {@link KvSelectField}. */
export function RoleSelectField({
  control,
  errorMessage,
  disabled,
}: RoleSelectFieldProps) {
  return (
    <Controller
      name="role"
      control={control}
      render={({ field }) => (
        <KvSelectField
          id="register-role"
          label="نقش کاربری"
          required
          disabled={disabled}
          error={errorMessage}
          placeholder="انتخاب نقش..."
          value={field.value ?? ''}
          onValueChange={field.onChange}
        >
          {SELF_REGISTERABLE_ROLES.map((role) => (
            <KvSelectItem key={role} value={role}>
              {REGISTER_ROLE_LABELS[role]}
            </KvSelectItem>
          ))}
        </KvSelectField>
      )}
    />
  );
}

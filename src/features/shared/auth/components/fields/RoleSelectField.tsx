import { Controller, type Control } from 'react-hook-form';

import { KvLabel } from '@/components/shared/KvLabel';
import {
  KvSelect,
  KvSelectContent,
  KvSelectItem,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/KvSelect';
import { cn } from '@/lib/utils';

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

/** Self-service role selector for step 1 of registration. */
export function RoleSelectField({
  control,
  errorMessage,
  disabled,
}: RoleSelectFieldProps) {
  return (
    <div>
      <KvLabel htmlFor="register-role">
        نقش کاربری <span className="text-rose-500">*</span>
      </KvLabel>
      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <KvSelect
            value={field.value ?? ''}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <KvSelectTrigger
              id="register-role"
              className={cn(errorMessage ? 'border-rose-300' : undefined)}
            >
              <KvSelectValue placeholder="انتخاب نقش..." />
            </KvSelectTrigger>
            <KvSelectContent>
              {SELF_REGISTERABLE_ROLES.map((role) => (
                <KvSelectItem key={role} value={role} className="text-xs font-bold">
                  {REGISTER_ROLE_LABELS[role]}
                </KvSelectItem>
              ))}
            </KvSelectContent>
          </KvSelect>
        )}
      />
      {errorMessage ? (
        <p className="mt-kv-field text-[11px] font-bold text-rose-500">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

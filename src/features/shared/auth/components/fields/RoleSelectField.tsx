import { Controller, type Control } from 'react-hook-form';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { REGISTER_ROLE_LABELS, SELF_REGISTERABLE_ROLES, type RegisterSchema } from '../../schemas/auth.schema';

interface RoleSelectFieldProps {
  control: Control<RegisterSchema>;
  errorMessage?: string;
  disabled?: boolean;
}

/** Self-service role selector for step 1 of registration (`kv-select` in the mockup). */
export function RoleSelectField({ control, errorMessage, disabled }: RoleSelectFieldProps) {
  return (
    <div>
      <Label htmlFor="register-role" className="mb-kv-field text-xs font-bold text-slate-600">
        نقش کاربری <span className="text-rose-500">*</span>
      </Label>
      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={disabled}>
            <SelectTrigger
              id="register-role"
              className={cn(
                'h-auto w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 shadow-none',
                'focus-visible:border-brand-500 focus-visible:ring-[3px] focus-visible:ring-brand-500/15',
                errorMessage ? 'border-rose-300' : 'border-slate-300'
              )}
            >
              <SelectValue placeholder="انتخاب نقش..." />
            </SelectTrigger>
            <SelectContent>
              {SELF_REGISTERABLE_ROLES.map((role) => (
                <SelectItem key={role} value={role} className="text-xs font-bold">
                  {REGISTER_ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errorMessage && <p className="mt-kv-field text-[11px] font-bold text-rose-500">{errorMessage}</p>}
    </div>
  );
}

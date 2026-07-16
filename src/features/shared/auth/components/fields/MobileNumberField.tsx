import type { ChangeEvent } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { KvTextField } from '@/components/shared/KvTextField';
import { persianToEnglishDigits } from '@/utils/persianDigits';

interface MobileNumberFieldProps {
  id: string;
  registration: UseFormRegisterReturn<'mobile'>;
  errorMessage?: string;
  disabled?: boolean;
}

function filterDigits(rawValue: string): string {
  return persianToEnglishDigits(rawValue).replace(/\D/g, '');
}

/** The "+98"-prefixed mobile input shared by the login and registration forms. */
export function MobileNumberField({
  id,
  registration,
  errorMessage,
  disabled,
}: MobileNumberFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.target.value = filterDigits(event.target.value);
    registration.onChange(event);
  };

  return (
    <div>
      <KvTextField
        id={id}
        label="شماره موبایل"
        required
        type="tel"
        size="sm"
        dir="ltr"
        inputMode="numeric"
        autoComplete="tel-national"
        maxLength={10}
        placeholder="9123456789"
        locked={Boolean(disabled)}
        name={registration.name}
        onBlur={registration.onBlur}
        ref={registration.ref}
        onChange={handleChange}
        error={errorMessage}
        startAddon={
          <span className="border-e border-slate-200/70 bg-slate-100/60 px-4 py-2.5 text-xs font-semibold text-slate-400">
            +98
          </span>
        }
      />
    </div>
  );
}

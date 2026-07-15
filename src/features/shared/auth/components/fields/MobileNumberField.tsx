import type { ChangeEvent } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { CircleAlert, CircleCheck } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { persianToEnglishDigits } from '@/utils/persianDigits';

interface MobileNumberFieldProps {
  id: string;
  registration: UseFormRegisterReturn<'mobile'>;
  currentValue: string;
  errorMessage?: string;
  disabled?: boolean;
}

/**
 * Normalizes Persian/Arabic digits to English, then strips anything that is
 * still not a plain digit (letters, symbols, RTL marks, …) so the field
 * always holds a clean numeric string before it ever reaches RHF state.
 */
function filterDigits(rawValue: string): string {
  return persianToEnglishDigits(rawValue).replace(/\D/g, '');
}

/** The "+98"-prefixed mobile input shared by the login and registration forms. */
export function MobileNumberField({ id, registration, currentValue, errorMessage, disabled }: MobileNumberFieldProps) {
  const isTouched = currentValue.length > 0;
  const isValid = isTouched && !errorMessage;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.target.value = filterDigits(event.target.value);
    registration.onChange(event);
  };

  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 text-xs font-bold text-slate-600">
        شماره موبایل <span className="text-rose-500">*</span>
      </Label>
      <div
        dir="ltr"
        className={cn(
          'flex w-full items-center overflow-hidden rounded-xl border bg-white transition-colors',
          'focus-within:border-brand-500 focus-within:ring-[3px] focus-within:ring-brand-500/15',
          errorMessage && isTouched ? 'border-rose-300' : 'border-slate-300'
        )}
      >
        <span className="border-e border-slate-200/70 bg-slate-100/60 px-4 py-2.5 text-xs font-semibold text-slate-400">+98</span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          placeholder="9123456789"
          disabled={disabled}
          className="w-full bg-transparent px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
          {...registration}
          onChange={handleChange}
        />
      </div>
      {isTouched && (
        <div className={cn('mt-1.5 flex items-center gap-1 text-[11px] font-bold', isValid ? 'text-emerald-500' : 'text-rose-500')}>
          {isValid ? <CircleCheck className="size-3" aria-hidden="true" /> : <CircleAlert className="size-3" aria-hidden="true" />}
          <span>{isValid ? 'شماره موبایل معتبر است.' : errorMessage || 'فرمت معتبر نیست (۱۰ رقم بدون صفر اول).'}</span>
        </div>
      )}
    </div>
  );
}

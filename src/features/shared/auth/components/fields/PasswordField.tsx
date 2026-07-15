'use client';

import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { CircleAlert, CircleCheck, Eye, EyeOff } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PasswordFieldProps {
  id: string;
  label: string;
  registration: UseFormRegisterReturn<string>;
  currentValue: string;
  errorMessage?: string;
}

/** Password input with a Lucide eye/eye-off visibility toggle (translated from `fa-eye` / `fa-eye-slash`). */
export function PasswordField({ id, label, registration, currentValue, errorMessage }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isTouched = currentValue.length > 0;
  const isValid = isTouched && !errorMessage;

  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 text-xs font-bold text-slate-600">
        {label} <span className="text-rose-500">*</span>
      </Label>
      <div
        dir="ltr"
        className={cn(
          'relative flex w-full items-center overflow-hidden rounded-xl border bg-white transition-colors',
          'focus-within:border-brand-500 focus-within:ring-[3px] focus-within:ring-brand-500/15',
          errorMessage && isTouched ? 'border-rose-300' : 'border-slate-300'
        )}
      >
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="********"
          className="w-full bg-transparent px-3.5 py-2.5 pe-10 text-sm font-bold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400"
          {...registration}
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={isVisible ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
          aria-pressed={isVisible}
          className="absolute end-3 text-slate-400 transition-colors hover:text-slate-600"
        >
          {isVisible ? <EyeOff className="size-3.5" aria-hidden="true" /> : <Eye className="size-3.5" aria-hidden="true" />}
        </button>
      </div>
      {isTouched && (
        <div className={cn('mt-1.5 flex items-center gap-1 text-[11px] font-bold', isValid ? 'text-emerald-500' : 'text-rose-500')}>
          {isValid ? <CircleCheck className="size-3" aria-hidden="true" /> : <CircleAlert className="size-3" aria-hidden="true" />}
          <span>{isValid ? 'رمز عبور معتبر است.' : errorMessage || 'رمز عبور باید حداقل ۶ کاراکتر باشد.'}</span>
        </div>
      )}
    </div>
  );
}

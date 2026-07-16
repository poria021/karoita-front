import type { UseFormRegisterReturn } from 'react-hook-form';
import { CircleAlert, CircleCheck } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface OtpCodeFieldProps {
  id: string;
  registration: UseFormRegisterReturn<'otp'>;
  currentValue: string;
  errorMessage?: string;
}

/** Centered, widely-tracked 5-digit SMS verification code input. */
export function OtpCodeField({ id, registration, currentValue, errorMessage }: OtpCodeFieldProps) {
  const isTouched = currentValue.length > 0;
  const isValid = isTouched && !errorMessage;

  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 text-xs font-bold text-slate-600">
        کد تایید ۵ رقمی <span className="text-rose-500">*</span>
      </Label>
      <div
        dir="ltr"
        className={cn(
          'flex w-full items-center overflow-hidden rounded-xl border bg-white transition-colors',
          'focus-within:border-brand-500 focus-within:ring-[3px] focus-within:ring-brand-500/15',
          errorMessage && isTouched ? 'border-rose-300' : 'border-slate-300'
        )}
      >
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          maxLength={5}
          placeholder="• • • • •"
          className="h-auto rounded-none border-0 bg-transparent px-3.5 py-2.5 text-center text-base font-black tracking-[0.5em] text-slate-800 shadow-none focus-visible:ring-0"
          {...registration}
        />
      </div>
      {isTouched && (
        <div className={cn('mt-1.5 flex items-center gap-1 text-[11px] font-bold', isValid ? 'text-emerald-500' : 'text-rose-500')}>
          {isValid ? <CircleCheck className="size-3" aria-hidden="true" /> : <CircleAlert className="size-3" aria-hidden="true" />}
          <span>{isValid ? 'کد تایید ۵ رقمی وارد شد.' : errorMessage || 'لطفاً کد ۵ رقمی را کامل کنید.'}</span>
        </div>
      )}
    </div>
  );
}

import { Clock, RotateCw, SquarePen } from 'lucide-react';

import { toPersianDigits } from '@/utils/persianDigits';

interface OtpResendFooterProps {
  secondsUntilResend: number;
  canResend: boolean;
  isResending: boolean;
  onResend: () => void;
  onGoBack: () => void;
  goBackLabel: string;
}

/** Resend countdown + "edit number" row shared by every OTP verification step. */
export function OtpResendFooter({ secondsUntilResend, canResend, isResending, onResend, onGoBack, goBackLabel }: OtpResendFooterProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-[10px] font-bold text-slate-400">
      {canResend ? (
        <button
          type="button"
          disabled={isResending}
          onClick={onResend}
          className="flex items-center gap-1 text-brand-500 hover:underline disabled:pointer-events-none disabled:opacity-50"
        >
          <RotateCw className={isResending ? 'size-3 animate-spin' : 'size-3'} aria-hidden="true" />
          <span>{isResending ? 'در حال ارسال...' : 'ارسال پیامک جدید'}</span>
        </button>
      ) : (
        <span className="flex items-center gap-1">
          <Clock className="size-3 text-slate-400" aria-hidden="true" />
          <span>
            ارسال مجدد تا <span className="font-mono text-slate-700">{toPersianDigits(secondsUntilResend)}</span> ثانیه دیگر
          </span>
        </span>
      )}
      <button type="button" onClick={onGoBack} className="flex items-center gap-1 text-slate-500 hover:text-slate-800">
        <span>{goBackLabel}</span>
        <SquarePen className="size-3" aria-hidden="true" />
      </button>
    </div>
  );
}

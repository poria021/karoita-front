import { Clock, RotateCw, SquarePen } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
export function OtpResendFooter({
  secondsUntilResend,
  canResend,
  isResending,
  onResend,
  onGoBack,
  goBackLabel,
}: OtpResendFooterProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-[10px] font-bold text-slate-400">
      {canResend ? (
        <Button
          type="button"
          variant="link"
          disabled={isResending}
          onClick={onResend}
          className="h-auto gap-1 p-0 text-[10px] font-bold text-brand-500"
        >
          <RotateCw className={isResending ? 'size-3 animate-spin' : 'size-3'} aria-hidden="true" />
          <span>{isResending ? 'در حال ارسال...' : 'ارسال پیامک جدید'}</span>
        </Button>
      ) : (
        <span className="flex items-center gap-1">
          <Clock className="size-3 text-slate-400" aria-hidden="true" />
          <span>
            ارسال مجدد تا <span className="font-mono text-slate-700">{toPersianDigits(secondsUntilResend)}</span> ثانیه دیگر
          </span>
        </span>
      )}
      <Button
        type="button"
        variant="ghost"
        onClick={onGoBack}
        className="h-auto gap-1 p-0 text-[10px] font-bold text-slate-500 hover:bg-transparent hover:text-slate-800"
      >
        <span>{goBackLabel}</span>
        <SquarePen className="size-3" aria-hidden="true" />
      </Button>
    </div>
  );
}

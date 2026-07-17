import { Clock, RotateCw, SquarePen } from 'lucide-react';

import { KvButton } from '@/components/shared/KvButton';
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
        <KvButton
          type="button"
          color="cta"
          appearance="text"
          size="sm"
          disabled={isResending}
          onClick={onResend}
          icon={
            <RotateCw
              className={isResending ? 'size-3 animate-spin' : 'size-3'}
              aria-hidden="true"
            />
          }
        >
          {isResending ? 'در حال ارسال...' : 'ارسال پیامک جدید'}
        </KvButton>
      ) : (
        <span className="flex items-center gap-1">
          <Clock className="size-3 text-slate-400" aria-hidden="true" />
          <span>
            ارسال مجدد تا{' '}
            <span className="font-mono text-slate-700">
              {toPersianDigits(secondsUntilResend)}
            </span>{' '}
            ثانیه دیگر
          </span>
        </span>
      )}
      <KvButton
        type="button"
        color="neutral"
        appearance="text"
        size="sm"
        onClick={onGoBack}
        icon={<SquarePen className="size-3" aria-hidden="true" />}
        iconPosition="end"
      >
        {goBackLabel}
      </KvButton>
    </div>
  );
}

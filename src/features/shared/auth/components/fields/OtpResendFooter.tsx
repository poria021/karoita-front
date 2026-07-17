import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { faIcons } from '@/utils/iconMap';
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
    <div className="flex items-center justify-between gap-kv-pair text-xs font-bold text-kv-text-faint">
      {canResend ? (
        <KvButton
          type="button"
          color="cta"
          appearance="text"
          size="sm"
          loading={isResending}
          onClick={onResend}
        >
          ارسال پیامک جدید
        </KvButton>
      ) : (
        <span className="flex items-center gap-kv-field">
          <FaIcon icon={faIcons.clock} size="xs" className="text-kv-text-faint" />
          <span>
            ارسال مجدد تا{' '}
            <span className="font-mono text-kv-text-muted">
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
        disabled={isResending}
        onClick={onGoBack}
      >
        {goBackLabel}
      </KvButton>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';

const DEFAULT_OTP_COUNTDOWN_SECONDS = 60;

/**
 * Drives the "ارسال مجدد تا XX ثانیه دیگر" resend countdown shown on every
 * OTP step. Starts idle (`0`); callers must `restart()` only after a successful send.
 * Shared by login, register, forgot-password, and admin-gate wizards.
 */
export function useOtpCountdown(durationInSeconds: number = DEFAULT_OTP_COUNTDOWN_SECONDS) {
  // Idle until `restart()` after a real OTP send — do not start counting on mount.
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;

    const timeoutId = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [secondsLeft]);

  const restart = useCallback(() => {
    setSecondsLeft(durationInSeconds);
  }, [durationInSeconds]);

  return {
    secondsLeft,
    canResend: secondsLeft <= 0,
    restart,
  };
}

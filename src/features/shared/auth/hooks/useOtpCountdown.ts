import { useCallback, useEffect, useState } from 'react';

const DEFAULT_OTP_COUNTDOWN_SECONDS = 60;

/**
 * Drives the "ارسال مجدد تا XX ثانیه دیگر" resend countdown shown on every
 * OTP step in `original-karvita.html`. Shared by `useLoginForm` and
 * `useRegisterForm` so both wizards behave identically.
 */
export function useOtpCountdown(durationInSeconds: number = DEFAULT_OTP_COUNTDOWN_SECONDS) {
  const [secondsLeft, setSecondsLeft] = useState(durationInSeconds);

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

import { useCallback, useEffect, useState } from 'react';

const DEFAULT_OTP_COUNTDOWN_SECONDS = 60;

/**
 * شمارش‌معکوس ارسال مجدد OTP — تا قبل از ارسال اول، در حالت idle می‌ماند.
 */
export function useOtpCountdown(durationInSeconds: number = DEFAULT_OTP_COUNTDOWN_SECONDS) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const isRunning = secondsLeft > 0;

  useEffect(() => {
    if (!isRunning) return undefined;

    const intervalId = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  const restart = useCallback(
    (seconds?: number) => {
      const next =
        typeof seconds === 'number' && Number.isFinite(seconds)
          ? Math.max(0, Math.round(seconds))
          : durationInSeconds;
      setSecondsLeft(next);
    },
    [durationInSeconds]
  );

  return {
    secondsLeft,
    canResend: secondsLeft <= 0,
    restart,
  };
}

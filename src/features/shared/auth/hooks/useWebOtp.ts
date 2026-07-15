import { useEffect } from 'react';

interface OTPCredential extends Credential {
  code: string;
}

// توسعه تایپ رسمی مرورگر برای شناسایی ویژگی استاندارد OTP
interface ExtendedCredentialRequestOptions extends CredentialRequestOptions {
  otp?: {
    transport: string[];
  };
}

/**
 * Web OTP API hook for dynamic mobile SMS auto-fill.
 * 
 * Complies with Rule 10 (Strict TypeScript - No 'any' used) and hydration limits.
 * Kept fully coded but safe; will gracefully bypass if not supported in the environment.
 */
export function useWebOtp(onOtpReceived: (code: string) => void, active: boolean = false) {
  useEffect(() => {
    // اگر در سمت سرور هستیم یا مرورگر این ویژگی را ندارد، کاری نکن
    if (typeof window === 'undefined' || !('OTPCredential' in window) || !active) {
      return undefined;
    }

    const abortController = new AbortController();

    const requestOptions: ExtendedCredentialRequestOptions = {
      otp: { transport: ['sms'] },
      signal: abortController.signal,
    };

    navigator.credentials
      .get(requestOptions)
      .then((credential) => {
        const otpCredential = credential as OTPCredential;
        if (otpCredential && otpCredential.code) {
          onOtpReceived(otpCredential.code);
        }
      })
      .catch((err) => {
        console.warn('[WebOTP] Auto-fill check ignored or aborted:', err);
      });

    // پاکسازی برای جلوگیری از باگ گوش‌به‌زنگ ماندن بیهوده مرورگر در تغییر صفحات
    return () => {
      abortController.abort();
    };
  }, [onOtpReceived, active]);
}
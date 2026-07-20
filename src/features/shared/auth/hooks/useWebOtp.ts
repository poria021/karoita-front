import { useEffect } from 'react';

interface OTPCredential extends Credential {
  code: string;
}

interface ExtendedCredentialRequestOptions extends CredentialRequestOptions {
  otp?: {
    transport: string[];
  };
}

export function useWebOtp(onOtpReceived: (code: string) => void, active: boolean = false) {
  useEffect(() => {
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

    return () => {
      abortController.abort();
    };
  }, [onOtpReceived, active]);
}
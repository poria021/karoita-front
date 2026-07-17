'use client';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { ForgotRequestStep } from './ForgotRequestStep';
import { ForgotResetStep } from './ForgotResetStep';
import { ForgotVerifyStep } from './ForgotVerifyStep';
import { LoginOtpRequestStep } from './LoginOtpRequestStep';
import { LoginOtpVerifyStep } from './LoginOtpVerifyStep';
import { LoginPasswordStep } from './LoginPasswordStep';

interface LoginFormProps {
  login: UseLoginFormReturn;
}

/**
 * Public login form: credential (mobile + password), OTP, or the embedded
 * password-recovery wizard, mirroring the "ورود" tab of `original-karvita.html`.
 *
 * Owns no state of its own — `login` is produced once by `useLoginForm` in
 * `AuthCard.tsx` so the parent can also read the active mode for the dynamic
 * tab label (rule 00, #7: keep this component a thin presentation layer).
 *
 * Field errors render under each control — no top-level alert banner.
 */
export function LoginForm({ login }: LoginFormProps) {
  return (
    <div className="flex flex-col gap-kv-group">
      {login.mode === 'password' && <LoginPasswordStep login={login} />}
      {login.mode === 'otp' && login.otpStep === 1 && <LoginOtpRequestStep login={login} />}
      {login.mode === 'otp' && login.otpStep === 2 && <LoginOtpVerifyStep login={login} />}
      {login.mode === 'forgot' && login.forgotStep === 1 && <ForgotRequestStep login={login} />}
      {login.mode === 'forgot' && login.forgotStep === 2 && <ForgotVerifyStep login={login} />}
      {login.mode === 'forgot' && login.forgotStep === 3 && <ForgotResetStep login={login} />}
    </div>
  );
}

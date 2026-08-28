'use client';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { LoginOtpRequestStep } from './LoginOtpRequestStep';
import { LoginOtpVerifyStep } from './LoginOtpVerifyStep';
import { LoginPasswordStep } from './LoginPasswordStep';

interface LoginFormProps {
  login: UseLoginFormReturn;
}

export function LoginForm({ login }: LoginFormProps) {
  return (
    <div className="flex flex-col gap-kv-group">
      {login.mode === 'password' && <LoginPasswordStep login={login} />}
      {login.mode === 'otp' && login.otpStep === 1 && (
        <LoginOtpRequestStep login={login} />
      )}
      {login.mode === 'otp' && login.otpStep === 2 && (
        <LoginOtpVerifyStep login={login} />
      )}
    </div>
  );
}

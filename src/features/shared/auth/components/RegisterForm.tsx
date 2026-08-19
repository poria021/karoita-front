'use client';

import dynamic from 'next/dynamic';

import { useRegisterForm } from '../hooks/useRegisterForm';
import { AuthFormMessage } from './fields/AuthFormMessage';

const RegisterDetailsStep = dynamic(
  () =>
    import('./RegisterDetailsStep').then((mod) => ({
      default: mod.RegisterDetailsStep,
    })),
  { ssr: false }
);

const RegisterOtpStep = dynamic(
  () =>
    import('./RegisterOtpStep').then((mod) => ({
      default: mod.RegisterOtpStep,
    })),
  { ssr: false }
);

export function RegisterForm() {
  const registerForm = useRegisterForm();

  return (
    <div className="flex flex-col gap-kv-stack">
      <AuthFormMessage
        message={registerForm.formMessage}
        onDismiss={registerForm.clearFormMessage}
      />

      {registerForm.step === 1 && (
        <RegisterDetailsStep registerForm={registerForm} />
      )}
      {registerForm.step === 2 && (
        <RegisterOtpStep registerForm={registerForm} />
      )}
    </div>
  );
}

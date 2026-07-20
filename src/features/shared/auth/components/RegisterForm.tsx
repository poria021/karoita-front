'use client';

import { useRegisterForm } from '../hooks/useRegisterForm';
import { AuthFormMessage } from './fields/AuthFormMessage';
import { RegisterDetailsStep } from './RegisterDetailsStep';
import { RegisterOtpStep } from './RegisterOtpStep';

export function RegisterForm() {
  const registerForm = useRegisterForm();

  return (
    <div className="flex flex-col gap-kv-stack">
      <AuthFormMessage
        message={registerForm.formMessage}
        onDismiss={registerForm.clearFormMessage}
      />

      {registerForm.step === 1 && <RegisterDetailsStep registerForm={registerForm} />}
      {registerForm.step === 2 && <RegisterOtpStep registerForm={registerForm} />}
    </div>
  );
}

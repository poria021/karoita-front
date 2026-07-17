'use client';

import { Controller } from 'react-hook-form';

import { KvButton } from '@/components/shared/KvButton';
import { KvCheckbox } from '@/components/shared/KvCheckbox';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { MobileNumberField } from './fields/MobileNumberField';
import { PasswordField } from './fields/PasswordField';

interface LoginPasswordStepProps {
  login: UseLoginFormReturn;
}

/** Rendered while `login.mode === 'password'`: mobile + password credential form. */
export function LoginPasswordStep({ login }: LoginPasswordStepProps) {
  const {
    passwordForm,
    submitPassword,
    isSubmittingPassword,
    switchToOtpMode,
    switchToForgotMode,
  } = login;
  const { register, control, formState } = passwordForm;

  return (
    <form onSubmit={submitPassword} className="flex flex-col gap-kv-section" noValidate>
      <div className="flex flex-col gap-kv-group">
        <MobileNumberField
          id="login-mobile"
          registration={register('mobile')}
          errorMessage={formState.errors.mobile?.message}
          disabled={isSubmittingPassword}
        />

        <div className="flex flex-col gap-kv-pair">
          <PasswordField
            id="login-password"
            label="رمز عبور"
            registration={register('password')}
            errorMessage={formState.errors.password?.message}
          />

          <div className="flex items-center justify-between">
            <KvButton
              type="button"
              color="neutral"
              appearance="text"
              size="sm"
              onClick={switchToForgotMode}
            >
              رمز خود را فراموش کردم
            </KvButton>

            <label
              htmlFor="login-remember"
              className="flex cursor-pointer items-center gap-kv-inline text-xs font-bold text-kv-text-subtle select-none"
            >
              <span>مرا به خاطر بسپار</span>
              <Controller
                name="remember"
                control={control}
                render={({ field }) => (
                  <KvCheckbox
                    id="login-remember"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    name={field.name}
                  />
                )}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-kv-group">
        <AuthSubmitButton isLoading={isSubmittingPassword} loadingLabel="در حال ورود...">
          ورود به سامانه
        </AuthSubmitButton>

        <KvButton type="button" appearance="secondary" fullWidth onClick={switchToOtpMode}>
          ورود با رمز یکبار مصرف (OTP)
        </KvButton>
      </div>
    </form>
  );
}

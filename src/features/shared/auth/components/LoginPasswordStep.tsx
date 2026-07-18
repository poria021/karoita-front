'use client';

import { useEffect } from 'react';
import { Controller } from 'react-hook-form';

import { KvButton } from '@/components/shared/KvButton';
import { KvCheckbox } from '@/components/shared/KvCheckbox';
import { KvMobileNumberField } from '@/components/shared/KvMobileNumberField';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { PasswordField } from './fields/PasswordField';

interface LoginPasswordStepProps {
  login: UseLoginFormReturn;
}

/**
 * Credential login: remember-me fills only the mobile field next visit.
 * Password stays empty; autocomplete=off avoids browser vault refill.
 */
export function LoginPasswordStep({ login }: LoginPasswordStepProps) {
  const {
    passwordForm,
    submitPassword,
    isSubmittingPassword,
    switchToOtpMode,
    switchToForgotMode,
  } = login;
  const { register, control, formState, setValue } = passwordForm;

  useEffect(() => {
    const clearInjectedPassword = () => {
      setValue('password', '', { shouldDirty: false, shouldValidate: false });
    };
    clearInjectedPassword();
    const t0 = window.setTimeout(clearInjectedPassword, 0);
    const t1 = window.setTimeout(clearInjectedPassword, 50);
    const t2 = window.setTimeout(clearInjectedPassword, 200);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [setValue]);

  return (
    <form
      onSubmit={submitPassword}
      className="flex flex-col gap-kv-section"
      noValidate
      autoComplete="off"
    >
      <div className="flex flex-col gap-kv-group">
        <Controller
          name="mobile"
          control={control}
          render={({ field }) => (
            <KvMobileNumberField
              id="login-mobile"
              required
              locked={isSubmittingPassword}
              error={formState.errors.mobile?.message}
              name={field.name}
              value={field.value}
              autoComplete="off"
              onBlur={field.onBlur}
              ref={field.ref}
              onChange={field.onChange}
            />
          )}
        />

        <div className="flex flex-col gap-kv-pair">
          <PasswordField
            id="login-password"
            label="رمز عبور"
            registration={register('password')}
            errorMessage={formState.errors.password?.message}
            autoComplete="off"
          />

          <div className="flex items-center justify-between">
            <KvButton
              type="button"
              color="neutral"
              appearance="text"
              size="sm"
              disabled={isSubmittingPassword}
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

        <KvButton
          type="button"
          appearance="secondary"
          fullWidth
          disabled={isSubmittingPassword}
          onClick={switchToOtpMode}
        >
          ورود با رمز یکبار مصرف (OTP)
        </KvButton>
      </div>
    </form>
  );
}

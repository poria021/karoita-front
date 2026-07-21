'use client';

import { Controller } from 'react-hook-form';

import { KvButton } from '@/components/shared/KvButton';
import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';
import { KvPasswordField } from '@/components/shared/fields/KvPasswordField';
import { Checkbox } from '@/components/ui/checkbox';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';

interface LoginPasswordStepProps {
  login: UseLoginFormReturn;
}

export function LoginPasswordStep({ login }: LoginPasswordStepProps) {
  const {
    passwordForm,
    submitPassword,
    isSubmittingPassword,
    switchToOtpMode,
    switchToForgotMode,
  } = login;
  const { control, formState } = passwordForm;

  return (
    <form
      onSubmit={submitPassword}
      className="flex flex-col gap-kv-section"
      noValidate
      autoComplete="off"
    >
      <input
        type="password"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="current-password"
        defaultValue=""
        readOnly
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />

      <div className="flex flex-col gap-kv-group">
        <Controller
          name="mobile"
          control={control}
          render={({ field }) => (
            <KvMobileNumberField
              id="login-mobile"
              required
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
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <KvPasswordField
                id="login-password"
                label="رمز عبور"
                required
                suppressBrowserAutofill
                error={formState.errors.password?.message}
                name={field.name}
                value={field.value}
                onBlur={field.onBlur}
                ref={field.ref}
                onChange={field.onChange}
              />
            )}
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
                  <Checkbox
                    id="login-remember"
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
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
        <AuthSubmitButton
          isLoading={isSubmittingPassword}
          loadingLabel="در حال ورود..."
        >
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

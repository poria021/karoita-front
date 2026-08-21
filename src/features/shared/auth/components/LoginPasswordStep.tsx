'use client';

import { Controller } from 'react-hook-form';

import { KvButton } from '@/components/shared/KvButton';
import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';
import { KvPasswordField } from '@/components/shared/fields/KvPasswordField';
import { KvTypography } from '@/components/shared/KvTypography';
import { Checkbox } from '@/components/ui/checkbox';

import type { UseLoginFormReturn } from '../hooks/useLoginForm';
import { AuthBusyForm } from './fields/AuthBusyForm';
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
    <AuthBusyForm
      busy={isSubmittingPassword}
      onSubmit={submitPassword}
      autoComplete="off"
    >
      <input
        type="password"
        id="login-autofill-trap"
        name="login-autofill-trap"
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
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <KvPasswordField
                id="login-password"
                label="رمز عبور"
                required
                locked={isSubmittingPassword}
                suppressBrowserAutofill
                error={formState.errors.password?.message}
                name={field.name}
                value={field.value}
                onBlur={field.onBlur}
                ref={field.ref}
                onChange={(event) => field.onChange(event.target.value)}
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
              className="flex cursor-pointer items-center gap-kv-inline select-none"
            >
              <KvTypography variant="label" as="span">
                مرا به خاطر بسپار
              </KvTypography>
              <Controller
                name="remember"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="login-remember"
                    disabled={isSubmittingPassword}
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
    </AuthBusyForm>
  );
}

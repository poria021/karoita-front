'use client';

import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { KvButton } from '@/components/shared/KvButton';
import { KvForm } from '@/components/shared/fields/KvForm';
import { KvPasswordField } from '@/components/shared/fields/KvPasswordField';
import { KvTypography } from '@/components/shared/KvTypography';

import type { SecurityChangePasswordSchema } from '../../schemas/security.schema';
import type { UseProfileForgotPasswordReturn } from '../../hooks/useProfileForgotPassword';
import { SecurityPasswordPairFields } from './SecurityPasswordPairFields';
import { SecurityProfileForgotPasswordModal } from './SecurityProfileForgotPasswordModal';

interface SecurityChangePasswordFlowProps {
  changeForm: UseFormReturn<SecurityChangePasswordSchema>;
  isBusy: boolean;
  isDisabled: boolean;
  forgotPassword?: UseProfileForgotPasswordReturn;
  onSubmit: () => void;
}

export function SecurityChangePasswordFlow({
  changeForm,
  isBusy,
  isDisabled,
  forgotPassword,
  onSubmit,
}: SecurityChangePasswordFlowProps) {
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  return (
    <>
      <KvForm {...changeForm}>
        <form onSubmit={onSubmit} className="space-y-kv-group" noValidate>
          <KvTypography variant="caption" tone="muted" weight="bold">
            برای تغییر رمز، رمز فعلی و رمز جدید را وارد کنید.
          </KvTypography>
          <KvPasswordField
            label="رمز عبور فعلی"
            required
            autoComplete="current-password"
            locked={isDisabled}
            error={changeForm.formState.errors.oldPassword?.message}
            {...changeForm.register('oldPassword')}
          />
          <SecurityPasswordPairFields
            form={changeForm}
            disabled={isDisabled}
            confirmLabel="تکرار رمز عبور جدید"
          />
          <div className="flex flex-col gap-kv-pair sm:flex-row sm:items-center sm:justify-between">
            {forgotPassword && (
              <KvButton
                type="button"
                color="neutral"
                appearance="text"
                size="sm"
                onClick={() => {
                  setForgotModalOpen(true);
                  forgotPassword.start();
                }}
              >
                رمز فعلی را فراموش کرده‌ام
              </KvButton>
            )}
            <KvButton
              type="submit"
              color="cta"
              appearance="solid"
              loading={isBusy}
              disabled={isDisabled}
            >
              ثبت رمز جدید
            </KvButton>
          </div>
        </form>
      </KvForm>

      {forgotPassword && (
        <SecurityProfileForgotPasswordModal
          open={forgotModalOpen}
          onOpenChange={setForgotModalOpen}
          forgotPassword={forgotPassword}
        />
      )}
    </>
  );
}

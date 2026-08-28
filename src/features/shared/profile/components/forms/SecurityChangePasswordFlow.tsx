'use client';

import Link from 'next/link';
import type { UseFormReturn } from 'react-hook-form';

import { KvButton } from '@/components/shared/KvButton';
import { KvForm } from '@/components/shared/fields/KvForm';
import { KvPasswordField } from '@/components/shared/fields/KvPasswordField';
import { KvTypography } from '@/components/shared/KvTypography';

import type { SecurityChangePasswordSchema } from '../../schemas/security.schema';
import { SecurityPasswordPairFields } from './SecurityPasswordPairFields';

interface SecurityChangePasswordFlowProps {
  changeForm: UseFormReturn<SecurityChangePasswordSchema>;
  isBusy: boolean;
  isDisabled: boolean;
  forgotHref: string;
  onPrepareForgot: () => void;
  onSubmit: () => void;
}

export function SecurityChangePasswordFlow({
  changeForm,
  isBusy,
  isDisabled,
  forgotHref,
  onPrepareForgot,
  onSubmit,
}: SecurityChangePasswordFlowProps) {
  return (
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
          <KvButton asChild color="neutral" appearance="text" size="sm">
            <Link href={forgotHref} prefetch={false} onClick={onPrepareForgot}>
              رمز فعلی را فراموش کرده‌ام
            </Link>
          </KvButton>
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
  );
}

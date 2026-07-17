'use client';

import { Loader2, MessageSquareLock } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import { KvButton } from '@/components/shared/KvButton';
import { KvForm } from '@/components/shared/KvForm';
import { KvTextField } from '@/components/shared/KvTextField';
import { MOCK_OTP_CODE } from '@/services/mock/auth-mock-users';
import { toPersianDigits } from '@/utils/persianDigits';

import type {
  SecurityOtpSchema,
  SecurityPasswordSchema,
} from '../../schemas/security.schema';
import { SecurityPasswordPairFields } from './SecurityPasswordPairFields';

type PasswordStep = 'initial' | 'otp_pending' | 'new_password_pending';

interface SecurityChangePasswordFlowProps {
  passwordStep: PasswordStep;
  passwordForm: UseFormReturn<SecurityPasswordSchema>;
  otpForm: UseFormReturn<SecurityOtpSchema>;
  isBusy: boolean;
  isDisabled: boolean;
  onRequestOtp: () => void;
  onVerifyOtp: () => void;
  onSaveNewPassword: () => void;
  onCancel: () => void;
}

export function SecurityChangePasswordFlow({
  passwordStep,
  passwordForm,
  otpForm,
  isBusy,
  isDisabled,
  onRequestOtp,
  onVerifyOtp,
  onSaveNewPassword,
  onCancel,
}: SecurityChangePasswordFlowProps) {
  if (passwordStep === 'initial') {
    return (
      <div className="space-y-kv-group">
        <p className="text-[11px] font-bold text-slate-600">
          برای تغییر رمز، تقاضای ارسال پیامک حاوی رمز فعال‌سازی کنید.
        </p>
        <KvButton
          type="button"
          color="cta"
          appearance="solid"
          fullWidth
          disabled={isDisabled}
          onClick={onRequestOtp}
          icon={
            isBusy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <MessageSquareLock className="size-4" aria-hidden="true" />
            )
          }
        >
          درخواست تغییر رمز عبور (ارسال پیامک تایید)
        </KvButton>
      </div>
    );
  }

  if (passwordStep === 'otp_pending') {
    return (
      <KvForm {...otpForm}>
        <form onSubmit={onVerifyOtp} className="space-y-kv-group" noValidate>
          <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 p-3 text-[11px] font-bold text-brand-950">
            <span>کد تایید ارسال شد.</span>
            <span className="rounded bg-brand-700 px-2 py-0.5 text-[10px] text-white">
              کد تستی شبیه‌ساز: {toPersianDigits(MOCK_OTP_CODE)}
            </span>
          </div>
          <KvTextField
            label="کد تایید ۵ رقمی"
            required
            type="tel"
            inputMode="numeric"
            maxLength={5}
            locked={isDisabled}
            placeholder="• • • • •"
            otpStyle
            dir="ltr"
            error={otpForm.formState.errors.otp?.message}
            {...otpForm.register('otp')}
          />
          <div className="flex gap-2">
            <KvButton
              type="button"
              appearance="secondary"
              className="flex-1"
              disabled={isDisabled}
              onClick={onCancel}
            >
              انصراف
            </KvButton>
            <KvButton
              type="submit"
              color="cta"
              appearance="solid"
              className="flex-1"
              disabled={isDisabled}
              icon={
                isBusy ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : undefined
              }
            >
              تایید کد و ادامه
            </KvButton>
          </div>
        </form>
      </KvForm>
    );
  }

  return (
    <KvForm {...passwordForm}>
      <form onSubmit={onSaveNewPassword} className="space-y-kv-group" noValidate>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[11px] font-bold text-emerald-900">
          احراز هویت موفقیت‌آمیز بود. رمز جدید را وارد کنید:
        </div>
        <SecurityPasswordPairFields
          form={passwordForm}
          disabled={isDisabled}
          confirmLabel="تکرار رمز عبور جدید"
        />
        <div className="flex gap-2">
          <KvButton
            type="button"
            appearance="secondary"
            className="flex-1"
            disabled={isDisabled}
            onClick={onCancel}
          >
            انصراف
          </KvButton>
          <KvButton
            type="submit"
            color="cta"
            appearance="solid"
            className="flex-1"
            disabled={isDisabled}
            icon={
              isBusy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : undefined
            }
          >
            ثبت نهایی رمز جدید
          </KvButton>
        </div>
      </form>
    </KvForm>
  );
}

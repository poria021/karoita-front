'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvForm } from '@/components/shared/fields/KvForm';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
import { MOCK_MODE_LABEL } from '@/lib/api-mode';
import { AuthService } from '@/services/auth.service';
import {
  persianToEnglishDigits,
  toPersianDigits,
} from '@/utils/persianDigits';

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

function filterDigits(rawValue: string): string {
  return persianToEnglishDigits(rawValue).replace(/\D/g, '');
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
        <KvTypography variant="caption" tone="muted" weight="bold">
          برای تغییر رمز، تقاضای ارسال پیامک حاوی رمز فعال‌سازی کنید.
        </KvTypography>
        <KvButton
          type="button"
          color="cta"
          appearance="solid"
          fullWidth
          loading={isBusy}
          disabled={isDisabled}
          onClick={onRequestOtp}
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
          <KvAlert
            variant="info"
            title="کد تأیید ارسال شد"
            description={
              (() => {
                const mockOtp = AuthService.getMockOtpHint();
                return mockOtp
                  ? `کد ${MOCK_MODE_LABEL} — نه Nest: ${toPersianDigits(mockOtp)}`
                  : 'کد تأیید به شماره موبایل شما ارسال شد.';
              })()
            }
          />
          <Controller
            control={otpForm.control}
            name="otp"
            render={({ field, fieldState }) => (
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
                error={fieldState.error?.message}
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={toPersianDigits(field.value ?? '')}
                onChange={(event) => {
                  field.onChange(filterDigits(event.target.value).slice(0, 5));
                }}
              />
            )}
          />
          <div className="flex gap-kv-pair">
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
              loading={isBusy}
              disabled={isDisabled}
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
        <KvAlert
          variant="success"
          title="احراز هویت موفقیت‌آمیز بود"
          description="رمز عبور جدید را در کادرهای زیر وارد کنید."
        />
        <SecurityPasswordPairFields
          form={passwordForm}
          disabled={isDisabled}
          confirmLabel="تکرار رمز عبور جدید"
        />
        <div className="flex gap-kv-pair">
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
            loading={isBusy}
            disabled={isDisabled}
          >
            ثبت نهایی رمز جدید
          </KvButton>
        </div>
      </form>
    </KvForm>
  );
}

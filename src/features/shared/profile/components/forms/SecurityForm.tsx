'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvForm } from '@/components/shared/fields/KvForm';
import { AuthService } from '@/services/auth.service';
import { forgotHref } from '@/features/shared/auth/lib/authHrefs';
import { writeAuthFlowMobilePrefill } from '@/features/shared/auth/utils/authFlowMobilePrefill';

import {
  securityChangePasswordSchema,
  securityPasswordSchema,
  type SecurityChangePasswordSchema,
  type SecurityPasswordSchema,
} from '../../schemas/security.schema';
import { SecurityChangePasswordFlow } from './SecurityChangePasswordFlow';
import { SecurityPasswordPairFields } from './SecurityPasswordPairFields';

export interface SecurityFormProps {
  mobile: string;
  hasPassword?: boolean;
  disabled?: boolean;
  onPasswordRegistered?: () => void;
}

export function SecurityForm({
  mobile,
  hasPassword = true,
  disabled = false,
  onPasswordRegistered,
}: SecurityFormProps) {
  const pathname = usePathname();
  const [passwordJustRegistered, setPasswordJustRegistered] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const hasExistingPassword = hasPassword || passwordJustRegistered;

  const passwordForm = useForm<SecurityPasswordSchema>({
    resolver: zodResolver(securityPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const changeForm = useForm<SecurityChangePasswordSchema>({
    resolver: zodResolver(securityChangePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const isDisabled = disabled || isBusy;

  const saveFirstTimePassword = passwordForm.handleSubmit(async (data) => {
    setFeedback(null);
    setIsBusy(true);
    try {
      await AuthService.setInitialPassword(mobile, data.newPassword);
      setPasswordJustRegistered(true);
      passwordForm.reset({ newPassword: '', confirmPassword: '' });
      setFeedback({ type: 'success', message: 'رمز عبور اولیه شما ثبت شد.' });
      onPasswordRegistered?.();
    } catch (error) {
      passwordForm.setError('newPassword', {
        message:
          error instanceof Error
            ? error.message
            : 'ثبت رمز عبور اولیه با خطا مواجه شد.',
      });
    } finally {
      setIsBusy(false);
    }
  });

  const saveChangedPassword = changeForm.handleSubmit(async (data) => {
    setFeedback(null);
    setIsBusy(true);
    try {
      await AuthService.setPassword(data.oldPassword, data.newPassword);
      changeForm.reset({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setFeedback({
        type: 'success',
        message: 'رمز عبور با موفقیت به‌روزرسانی شد.',
      });
    } catch (error) {
      changeForm.setError('oldPassword', {
        message:
          error instanceof Error
            ? error.message
            : 'به‌روزرسانی رمز عبور با خطا مواجه شد.',
      });
    } finally {
      setIsBusy(false);
    }
  });

  return (
    <KvCard
      dir="rtl"
      className="w-full gap-0 rounded-kv-panel border-kv-border py-0 shadow-kv-raised"
    >
      <KvCardContent className="space-y-kv-section p-kv-inset sm:p-kv-block">
        {!hasExistingPassword ? (
          <KvForm {...passwordForm}>
            <form
              onSubmit={saveFirstTimePassword}
              className="space-y-kv-group"
              noValidate
            >
              <KvAlert
                variant="warning"
                title="برای حساب شما هنوز رمز عبور ثبت نشده است"
                description="رمز عبور جدید را در کادرهای زیر وارد و ثبت کنید."
              />
              <SecurityPasswordPairFields
                form={passwordForm}
                disabled={isDisabled}
              />
              <div className="flex justify-end border-t border-kv-border pt-kv-group">
                <KvButton
                  type="submit"
                  color="cta"
                  appearance="solid"
                  loading={isBusy}
                  disabled={disabled}
                >
                  تأیید و ثبت رمز عبور اولیه
                </KvButton>
              </div>
            </form>
          </KvForm>
        ) : (
          <SecurityChangePasswordFlow
            changeForm={changeForm}
            isBusy={isBusy}
            isDisabled={isDisabled}
            forgotHref={forgotHref({ returnUrl: pathname })}
            onPrepareForgot={() => writeAuthFlowMobilePrefill(mobile)}
            onSubmit={saveChangedPassword}
          />
        )}

        {feedback ? (
          <KvAlert variant={feedback.type} title={feedback.message} />
        ) : null}
      </KvCardContent>
    </KvCard>
  );
}

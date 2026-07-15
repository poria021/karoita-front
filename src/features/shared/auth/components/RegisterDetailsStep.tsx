'use client';

import { UserPlus } from 'lucide-react';

import type { UseRegisterFormReturn } from '../hooks/useRegisterForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { MobileNumberField } from './fields/MobileNumberField';
import { RoleSelectField } from './fields/RoleSelectField';

interface RegisterDetailsStepProps {
  registerForm: UseRegisterFormReturn;
}

/** Step 1 of registration: mobile number + self-service role selection. */
export function RegisterDetailsStep({ registerForm }: RegisterDetailsStepProps) {
  const { detailsForm, submitDetails, isSubmittingDetails } = registerForm;
  const { register, watch, control, formState } = detailsForm;
  const mobileValue = watch('mobile');

  return (
    <form onSubmit={submitDetails} className="space-y-4" noValidate>
      <MobileNumberField
        id="register-mobile"
        registration={register('mobile')}
        currentValue={mobileValue}
        errorMessage={formState.errors.mobile?.message}
        disabled={isSubmittingDetails}
      />

      <RoleSelectField control={control} errorMessage={formState.errors.role?.message} disabled={isSubmittingDetails} />

      <AuthSubmitButton
        isReady={formState.isValid}
        isLoading={isSubmittingDetails}
        loadingLabel="در حال ارسال..."
        icon={<UserPlus className="size-4" aria-hidden="true" />}
      >
        ارسال کد تایید و ثبت‌نام
      </AuthSubmitButton>
    </form>
  );
}

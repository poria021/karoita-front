'use client';

import type { UseRegisterFormReturn } from '../hooks/useRegisterForm';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { MobileNumberField } from './fields/MobileNumberField';
import { RoleSelectField } from './fields/RoleSelectField';

interface RegisterDetailsStepProps {
  registerForm: UseRegisterFormReturn;
}

/** Step 1 of registration: mobile number + self-service role selection. */
export function RegisterDetailsStep({ registerForm }: RegisterDetailsStepProps) {
  const { detailsForm, submitDetails, isSubmittingDetails } = registerForm;
  const { register, control, formState } = detailsForm;

  return (
    <form onSubmit={submitDetails} className="flex flex-col gap-kv-section" noValidate>
      <AuthStepHeading step={1} totalSteps={2} />

      <div className="flex flex-col gap-kv-group">
        <MobileNumberField
          id="register-mobile"
          registration={register('mobile')}
          errorMessage={formState.errors.mobile?.message}
          disabled={isSubmittingDetails}
        />

        <RoleSelectField
          control={control}
          errorMessage={formState.errors.role?.message}
          disabled={isSubmittingDetails}
        />
      </div>

      <AuthSubmitButton isLoading={isSubmittingDetails} loadingLabel="در حال ارسال...">
        ارسال کد تایید و ثبت‌نام
      </AuthSubmitButton>
    </form>
  );
}

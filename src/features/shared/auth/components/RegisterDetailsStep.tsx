'use client';

import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';

import type { UseRegisterFormReturn } from '../hooks/useRegisterForm';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { RoleSelectField } from './fields/RoleSelectField';

interface RegisterDetailsStepProps {
  registerForm: UseRegisterFormReturn;
}

export function RegisterDetailsStep({ registerForm }: RegisterDetailsStepProps) {
  const { detailsForm, submitDetails, isSubmittingDetails } = registerForm;
  const { register, control, formState } = detailsForm;
  const mobileField = register('mobile');

  return (
    <form onSubmit={submitDetails} className="flex flex-col gap-kv-section" noValidate>
      <AuthStepHeading step={1} totalSteps={2} />

      <div className="flex flex-col gap-kv-group">
        <KvMobileNumberField
          id="register-mobile"
          required
          error={formState.errors.mobile?.message}
          name={mobileField.name}
          onBlur={mobileField.onBlur}
          ref={mobileField.ref}
          onChange={mobileField.onChange}
        />

        <RoleSelectField
          control={control}
          errorMessage={formState.errors.role?.message}
        />
      </div>

      <AuthSubmitButton isLoading={isSubmittingDetails} loadingLabel="در حال ارسال...">
        ارسال کد تایید و ثبت‌نام
      </AuthSubmitButton>
    </form>
  );
}

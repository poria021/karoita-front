'use client';

import { Controller } from 'react-hook-form';

import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';

import type { UseRegisterFormReturn } from '../hooks/useRegisterForm';
import { AuthStepHeading } from './AuthStepHeading';
import { AuthBusyForm } from './fields/AuthBusyForm';
import { AuthSubmitButton } from './fields/AuthSubmitButton';
import { RoleSelectField } from './fields/RoleSelectField';

interface RegisterDetailsStepProps {
  registerForm: UseRegisterFormReturn;
}

export function RegisterDetailsStep({ registerForm }: RegisterDetailsStepProps) {
  const { detailsForm, submitDetails, isSubmittingDetails } = registerForm;
  const { control, formState } = detailsForm;

  return (
    <AuthBusyForm busy={isSubmittingDetails} onSubmit={submitDetails}>
      <AuthStepHeading step={1} totalSteps={2} />

      <div className="flex flex-col gap-kv-group">
        <Controller
          name="mobile"
          control={control}
          render={({ field }) => (
            <KvMobileNumberField
              id="register-mobile"
              required
              locked={isSubmittingDetails}
              error={formState.errors.mobile?.message}
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              ref={field.ref}
              onChange={field.onChange}
            />
          )}
        />

        <RoleSelectField
          control={control}
          disabled={isSubmittingDetails}
          errorMessage={formState.errors.role?.message}
        />
      </div>

      <AuthSubmitButton isLoading={isSubmittingDetails} loadingLabel="در حال ارسال...">
        ارسال کد تایید و ثبت‌نام
      </AuthSubmitButton>
    </AuthBusyForm>
  );
}

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';

import { RouteService } from '@/services/route.service';
import { UserService } from '@/services/user.service';
import { useUserStore } from '@/store/useUserStore';

import {
  createProfileSchema,
  type ProfileSchema,
} from '../schemas/profile.schema';

/**
 * Profile form hook — Step 5.2 onboarding lifecycle.
 * Client-only. Never invoke inside a React Server Component.
 */
export function useProfileForm() {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);

  if (!activeUser) {
    throw new Error(
      'useProfileForm: activeUser is null. Wrap the parent component in an authenticated guard.'
    );
  }

  const roleSchema = createProfileSchema(activeUser.role);
  const form: UseFormReturn<ProfileSchema> = useForm<ProfileSchema>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      role: activeUser.role,
      firstName: activeUser.firstName || '',
      lastName: activeUser.lastName || '',
      province: activeUser.province || '',
      ...(activeUser.college && { college: activeUser.college }),
      ...(activeUser.major && { major: activeUser.major }),
      ...(activeUser.district && { district: activeUser.district }),
      ...(activeUser.school && { school: activeUser.school }),
      ...(activeUser.studentId && { studentId: activeUser.studentId }),
      ...(activeUser.skillCode && { skillCode: activeUser.skillCode }),
      ...(activeUser.personalCode && { personalCode: activeUser.personalCode }),
    } as ProfileSchema,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [identityDoc, setIdentityDoc] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitProfile = form.handleSubmit(async (data: ProfileSchema) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await UserService.updateProfile({
        ...data,
        identityDoc,
      });

      router.push(RouteService.karvita.dashboard());
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'ثبت مشخصات با خطا مواجه شد.';
      setSubmitError(message);
      console.error('Profile submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    form,
    isSubmitting,
    submitProfile,
    identityDoc,
    setIdentityDoc,
    submitError,
  };
}

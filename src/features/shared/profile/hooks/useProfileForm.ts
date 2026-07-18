'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';

import { getPostLoginPath } from '@/services/post-login-path';
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
 * Without activeUser: redirects to login; does not throw during render.
 */
export function useProfileForm() {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);
  const role = activeUser?.role ?? 'student';

  useEffect(() => {
    if (!activeUser) {
      router.replace(RouteService.auth.login());
    }
  }, [activeUser, router]);

  const roleSchema = createProfileSchema(role);
  const form: UseFormReturn<ProfileSchema> = useForm<ProfileSchema>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      role,
      firstName: activeUser?.firstName || '',
      lastName: activeUser?.lastName || '',
      province: activeUser?.province || '',
      ...(activeUser?.college && { college: activeUser.college }),
      ...(activeUser?.major && { major: activeUser.major }),
      ...(activeUser?.district && { district: activeUser.district }),
      ...(activeUser?.school && { school: activeUser.school }),
      ...(activeUser?.studentId && { studentId: activeUser.studentId }),
      ...(activeUser?.skillCode && { skillCode: activeUser.skillCode }),
      ...(activeUser?.personalCode && { personalCode: activeUser.personalCode }),
    } as ProfileSchema,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [identityDoc, setIdentityDoc] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitProfile = form.handleSubmit(async (data: ProfileSchema) => {
    if (!useUserStore.getState().activeUser) {
      setSubmitError('نشست کاربری یافت نشد. لطفاً دوباره وارد شوید.');
      router.replace(RouteService.auth.login());
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await UserService.updateProfile({
        ...data,
        identityDoc,
      });

      const user = useUserStore.getState().activeUser;
      router.push(getPostLoginPath(user));
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

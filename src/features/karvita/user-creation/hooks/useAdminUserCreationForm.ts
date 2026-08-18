'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';

import { scheduleUndoableMutation } from '@/lib/undoable-mutation';
import { AdminUserCreationService } from '@/services/admin-user-creation.service';
import type { CreateOrganizationalUserInput } from '@/types/admin-user-creation';
import { persianToEnglishDigits } from '@/utils/persianDigits';
import {
  orgAccountRequiresCity,
  orgAccountRequiresCollege,
  orgAccountRequiresDistrict,
  orgAccountRequiresProvince,
} from '@/utils/roleFieldStrategy';

import { ADMIN_USER_CREATION_DEFAULTS } from '../constants';
import {
  adminUserCreationSchema,
  type AdminUserCreationFormInput,
  type AdminUserCreationFormValues,
} from '../schemas/admin-user-creation.schema';

function normalizeMobile(value: string): string {
  return persianToEnglishDigits(value).replace(/\D/g, '').slice(0, 10);
}

export function useAdminUserCreationForm() {
  const form = useForm<AdminUserCreationFormInput>({
    resolver: zodResolver(
      adminUserCreationSchema
    ) as Resolver<AdminUserCreationFormInput>,
    defaultValues: { ...ADMIN_USER_CREATION_DEFAULTS },
    mode: 'onSubmit',
  });

  const { setValue, reset, handleSubmit, formState, control } = form;

  const [mobile, role] = useWatch({
    control,
    name: ['mobile', 'role'],
  });

  const [mobileDuplicate, setMobileDuplicate] = useState(false);
  const [checkingMobile, setCheckingMobile] = useState(false);
  const mobileRequestIdRef = useRef(0);

  const updateMobileReviewState = useCallback(
    (duplicate: boolean, checking: boolean) => {
      setMobileDuplicate(duplicate);
      setCheckingMobile(checking);
    },
    []
  );

  const resetMobileReviewState = useCallback(() => {
    mobileRequestIdRef.current += 1;
    updateMobileReviewState(false, false);
  }, [updateMobileReviewState]);

  const mobileNormalized = normalizeMobile(mobile ?? '');
  const mobileComplete = /^9\d{9}$/.test(mobileNormalized);
  const needsProvinceRole = orgAccountRequiresProvince(role);
  const needsCollege = orgAccountRequiresCollege(role);
  const needsRegional =
    orgAccountRequiresCity(role) && orgAccountRequiresDistrict(role);

  useEffect(() => {
    if (!mobileComplete) {
      const resetTimer = window.setTimeout(() => {
        resetMobileReviewState();
      }, 0);

      return () => window.clearTimeout(resetTimer);
    }

    const requestId = ++mobileRequestIdRef.current;
    const startTimer = window.setTimeout(() => {
      updateMobileReviewState(false, true);

      const timer = window.setTimeout(() => {
        void AdminUserCreationService.checkMobileAvailable(mobileNormalized)
          .then((result) => {
            if (requestId !== mobileRequestIdRef.current) return;

            updateMobileReviewState(!result.available, false);

            if (!result.available) {
              toast.error(
                'هشدار امنیتی: این شماره موبایل قبلاً در سامانه ثبت شده است!'
              );
            }
          })
          .catch(() => {
            if (requestId === mobileRequestIdRef.current) {
              updateMobileReviewState(false, false);
            }
          });
      }, 400);

      return () => window.clearTimeout(timer);
    }, 0);

    return () => {
      mobileRequestIdRef.current += 1;
      window.clearTimeout(startTimer);
    };
  }, [mobileComplete, mobileNormalized, resetMobileReviewState, updateMobileReviewState]);

  const onRoleChange = useCallback(
    (nextRole: string) => {
      setValue('role', nextRole as AdminUserCreationFormInput['role'], {
        shouldValidate: false,
      });
      setValue('province', '');
      setValue('city', '');
      setValue('college', '');
      setValue('district', '');
    },
    [setValue]
  );

  const onProvinceChange = useCallback(
    (next: string) => {
      setValue('province', next, { shouldValidate: false });
      setValue('city', '');
      setValue('college', '');
      setValue('district', '');
    },
    [setValue]
  );

  const onCityChange = useCallback(
    (next: string) => {
      setValue('city', next, { shouldValidate: false });
      setValue('district', '');
    },
    [setValue]
  );

  const onSubmit = handleSubmit(async (values) => {
    if (checkingMobile) {
      toast.warning('لطفاً تا اتمام بررسی شماره موبایل شکیبا باشید.');
      return;
    }

    if (mobileDuplicate) {
      toast.error('این شماره موبایل قبلاً در سیستم ثبت شده است.');
      return;
    }

    const typedValues = values as AdminUserCreationFormValues;

    const payload: CreateOrganizationalUserInput = {
      firstName: typedValues.firstName,
      lastName: typedValues.lastName,
      mobile: typedValues.mobile,
      password: typedValues.password,
      role: typedValues.role,
      province: typedValues.province || undefined,
      city: typedValues.city || undefined,
      college: typedValues.college || undefined,
      district: typedValues.district || undefined,
    };

    const formSnapshot = { ...values };
    const mobileDuplicateSnapshot = mobileDuplicate;

    scheduleUndoableMutation({
      message: 'حساب کاربری سازمانی جدید ایجاد و فعال گردید.',
      undoLabel: 'لغو',
      apply: () => {
        reset({ ...ADMIN_USER_CREATION_DEFAULTS });
        setMobileDuplicate(false);
      },
      revert: () => {
        reset(formSnapshot);
        setMobileDuplicate(mobileDuplicateSnapshot);
      },
      commit: () =>
        AdminUserCreationService.createOrganizationalUser(payload),
      onError: (error: unknown) => {
        toast.error(
          error instanceof Error
            ? error.message
            : 'ایجاد حساب کاربری ناموفق بود.'
        );
      },
    });
  });

  return {
    form,
    formState,
    mobile,
    role,
    needsProvinceRole,
    needsCollege,
    needsRegional,
    mobileComplete,
    mobileDuplicate,
    checkingMobile,
    submitting: formState.isSubmitting,
    onRoleChange,
    onProvinceChange,
    onCityChange,
    onSubmit,
  };
}
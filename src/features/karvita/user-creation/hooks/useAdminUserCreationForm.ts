'use client';

import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';

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

  const { watch, setValue, reset, handleSubmit, formState } = form;

  const mobile = watch('mobile');
  const role = watch('role');

  const [mobileDuplicate, setMobileDuplicate] = useState(false);
  const [checkingMobile, setCheckingMobile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const mobileNormalized = normalizeMobile(mobile);
  const mobileComplete = /^9\d{9}$/.test(mobileNormalized);
  const needsProvinceRole = orgAccountRequiresProvince(role);
  const needsCollege = orgAccountRequiresCollege(role);
  const needsRegional =
    orgAccountRequiresCity(role) && orgAccountRequiresDistrict(role);

  useEffect(() => {
    if (!mobileComplete) {
      setMobileDuplicate(false);
      return;
    }

    let cancelled = false;
    setCheckingMobile(true);

    void AdminUserCreationService.checkMobileAvailable(mobileNormalized)
      .then((result) => {
        if (cancelled) return;
        setMobileDuplicate(!result.available);
        if (!result.available) {
          toast.error(
            'هشدار امنیتی: این شماره موبایل قبلاً در سامانه ثبت شده است!'
          );
        }
      })
      .catch(() => {
        if (!cancelled) setMobileDuplicate(false);
      })
      .finally(() => {
        if (!cancelled) setCheckingMobile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mobileComplete, mobileNormalized]);

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

  const onSubmit = handleSubmit(async (raw) => {
    if (mobileDuplicate) {
      toast.error('این شماره موبایل قبلاً در سیستم ثبت شده است.');
      return;
    }

    const parsed = adminUserCreationSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(
        'لطفاً مشخصات حساب کاربری را طبق ترتیب الزامی فرم تکمیل فرمایید.'
      );
      return;
    }

    const values: AdminUserCreationFormValues = parsed.data;
    const payload: CreateOrganizationalUserInput = {
      firstName: values.firstName,
      lastName: values.lastName,
      mobile: values.mobile,
      password: values.password,
      role: values.role,
      province: values.province || undefined,
      city: values.city || undefined,
      college: values.college || undefined,
      district: values.district || undefined,
    };

    setSubmitting(true);
    try {
      await AdminUserCreationService.createOrganizationalUser(payload);
      toast.success('حساب کاربری سازمانی جدید با موفقیت ایجاد و فعال گردید.');
      reset({ ...ADMIN_USER_CREATION_DEFAULTS });
      setMobileDuplicate(false);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'ایجاد حساب کاربری ناموفق بود.'
      );
    } finally {
      setSubmitting(false);
    }
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
    submitting,
    onRoleChange,
    onProvinceChange,
    onCityChange,
    onSubmit,
  };
}

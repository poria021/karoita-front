'use client';

import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';

import { AdminUserCreationService } from '@/services/admin-user-creation.service';
import { OrganizationOptionsService } from '@/services/organization-options.service';
import type { OrganizationOption } from '@/services/organization-options.service';
import type { CreateOrganizationalUserInput } from '@/types/admin-user-creation';
import { persianToEnglishDigits } from '@/utils/persianDigits';

import {
  ADMIN_USER_CREATION_DEFAULTS,
  ORG_OPTIONS_FETCH_LIMIT,
} from '../constants';
import {
  adminUserCreationSchema,
  type AdminUserCreationFormInput,
  type AdminUserCreationFormValues,
} from '../schemas/admin-user-creation.schema';

function normalizeMobile(value: string): string {
  return persianToEnglishDigits(value).replace(/\D/g, '').slice(0, 10);
}

async function fetchOrgOptions(
  type: 'province' | 'city' | 'college' | 'district',
  province = ''
): Promise<OrganizationOption[]> {
  const result = await OrganizationOptionsService.getOptions({
    type,
    province,
    page: 1,
    limit: ORG_OPTIONS_FETCH_LIMIT,
  });
  return result.items;
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

  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const mobile = watch('mobile');
  const password = watch('password');
  const role = watch('role');
  const province = watch('province');
  const city = watch('city');

  const [mobileDuplicate, setMobileDuplicate] = useState(false);
  const [checkingMobile, setCheckingMobile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [provinces, setProvinces] = useState<OrganizationOption[]>([]);
  const [cities, setCities] = useState<OrganizationOption[]>([]);
  const [colleges, setColleges] = useState<OrganizationOption[]>([]);
  const [districts, setDistricts] = useState<OrganizationOption[]>([]);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [loadingProvinces, setLoadingProvinces] = useState(false);

  const canEditLastName = firstName.trim().length > 0;
  const canEditMobile = lastName.trim().length > 0;
  const mobileNormalized = normalizeMobile(mobile);
  const mobileComplete = /^9\d{9}$/.test(mobileNormalized);
  const canEditPassword =
    canEditMobile && mobileComplete && !mobileDuplicate && !checkingMobile;
  const canEditRole =
    canEditPassword && password.trim().length >= 4;
  const needsProvinceRole =
    role === 'provincial_university' ||
    role === 'faculty_role' ||
    role === 'regional_edu_admin';
  const needsCollege = role === 'faculty_role';
  const needsRegional = role === 'regional_edu_admin';

  useEffect(() => {
    if (!needsProvinceRole) {
      setProvinces([]);
      return;
    }

    let cancelled = false;
    setLoadingProvinces(true);
    setOptionsError(null);

    void fetchOrgOptions('province')
      .then((items) => {
        if (!cancelled) setProvinces(items);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setOptionsError(
            error instanceof Error
              ? error.message
              : 'بارگذاری فهرست استان‌ها ناموفق بود.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProvinces(false);
      });

    return () => {
      cancelled = true;
    };
  }, [needsProvinceRole]);

  useEffect(() => {
    if (!needsCollege && !needsRegional) {
      setCities([]);
      setColleges([]);
      setDistricts([]);
      return;
    }
    if (!province) {
      setCities([]);
      setColleges([]);
      setDistricts([]);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        if (needsCollege) {
          const items = await fetchOrgOptions('college', province);
          if (!cancelled) setColleges(items);
        }
        if (needsRegional) {
          const [cityItems, districtItems] = await Promise.all([
            fetchOrgOptions('city', province),
            fetchOrgOptions('district', province),
          ]);
          if (!cancelled) {
            setCities(cityItems);
            setDistricts(districtItems);
          }
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setOptionsError(
            error instanceof Error
              ? error.message
              : 'بارگذاری گزینه‌های سازمانی ناموفق بود.'
          );
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [needsCollege, needsRegional, province]);

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
      toast.error('لطفاً مشخصات حساب کاربری را طبق ترتیب الزامی فرم تکمیل فرمایید.');
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
      setCities([]);
      setColleges([]);
      setDistricts([]);
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
    firstName,
    lastName,
    mobile,
    password,
    role,
    province,
    city,
    canEditLastName,
    canEditMobile,
    canEditPassword,
    canEditRole,
    needsProvinceRole,
    needsCollege,
    needsRegional,
    mobileComplete,
    mobileDuplicate,
    checkingMobile,
    submitting,
    provinces,
    cities,
    colleges,
    districts,
    loadingProvinces,
    optionsError,
    onRoleChange,
    onProvinceChange,
    onCityChange,
    onSubmit,
  };
}

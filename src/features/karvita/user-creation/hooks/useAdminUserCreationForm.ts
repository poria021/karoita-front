'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';

import { scheduleOptimisticMutation } from '@/lib/undoable-mutation';
import { AdminUserCreationService } from '@/services/admin-user-creation.service';
import type { CreateOrganizationalUserInput } from '@/types/admin-user-creation';
import { persianToEnglishDigits } from '@/utils/persianDigits';
import {
  orgAccountRequiresCity,
  orgAccountRequiresCollege,
  orgAccountRequiresDistrict,
  orgAccountRequiresProvince,
} from '@/utils/roleFieldStrategy';

import {
  ADMIN_USER_CREATION_DEFAULTS,
  getOrgAccountRoleOptionsForKind,
  isOrgAccountRoleAllowedForKind,
  ORG_ACCOUNT_KIND_TABS,
  type OrgAccountKind,
} from '../constants';
import {
  adminUserCreationSchema,
  type AdminUserCreationFormInput,
  type AdminUserCreationFormValues,
} from '../schemas/admin-user-creation.schema';
import { isStaffAdminRole } from '@/utils/RoleStrategyMap';

function normalizeMobile(value: string): string {
  return persianToEnglishDigits(value).replace(/\D/g, '').slice(0, 10);
}

export function useAdminUserCreationForm(options?: {
  onStaffAdminCreated?: () => void;
}) {
  const form = useForm<AdminUserCreationFormInput>({
    resolver: zodResolver(
      adminUserCreationSchema
    ) as Resolver<AdminUserCreationFormInput>,
    defaultValues: { ...ADMIN_USER_CREATION_DEFAULTS },
    mode: 'onSubmit',
  });

  const { setValue, reset, handleSubmit, formState, control, getValues } = form;
  const [accountKind, setAccountKind] = useState<OrgAccountKind>('user');
  const roleOptions = getOrgAccountRoleOptionsForKind(accountKind);

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

  const onAccountKindChange = useCallback(
    (nextValue: string) => {
      const nextKind = ORG_ACCOUNT_KIND_TABS.find(
        (tab) => tab.value === nextValue
      )?.value;
      if (!nextKind || nextKind === accountKind) return;

      setAccountKind(nextKind);
      const currentRole = getValues('role');
      if (
        currentRole &&
        !isOrgAccountRoleAllowedForKind(currentRole, nextKind)
      ) {
        onRoleChange('');
      }
    },
    [accountKind, getValues, onRoleChange]
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

    const isStaffAdmin = isStaffAdminRole(typedValues.role);

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
    const accountKindSnapshot = accountKind;

    scheduleOptimisticMutation({
      message: isStaffAdmin
        ? 'حساب ادمین جدید ایجاد گردید.'
        : 'حساب کاربری سازمانی جدید ایجاد و فعال گردید.',
      apply: () => {
        reset({ ...ADMIN_USER_CREATION_DEFAULTS });
        setMobileDuplicate(false);
        if (!isStaffAdmin) {
          setAccountKind('user');
        }
      },
      revert: () => {
        reset(formSnapshot);
        setMobileDuplicate(mobileDuplicateSnapshot);
        setAccountKind(accountKindSnapshot);
      },
      commit: () =>
        AdminUserCreationService.createOrganizationalUser(payload),
      onCommitted: () => {
        if (isStaffAdmin) options?.onStaffAdminCreated?.();
      },
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
    accountKind,
    roleOptions,
    needsProvinceRole,
    needsCollege,
    needsRegional,
    mobileComplete,
    mobileDuplicate,
    checkingMobile,
    submitting: formState.isSubmitting,
    onRoleChange,
    onAccountKindChange,
    onProvinceChange,
    onCityChange,
    onSubmit,
  };
}
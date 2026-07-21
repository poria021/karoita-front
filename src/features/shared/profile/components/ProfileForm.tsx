'use client';

import { Controller, type FieldPath } from 'react-hook-form';
import type { ChangeEvent } from 'react';

import { KvButton } from '@/components/shared/KvButton';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvCardTitleIcon } from '@/components/shared/KvCardTitleIcon';
import { useUserStore } from '@/store/useUserStore';
import type { User } from '@/types/auth';
import { faIcons } from '@/utils/iconMap';
import {
  persianToEnglishDigits,
  toPersianDigits,
} from '@/utils/persianDigits';

import { useProfileForm } from '../hooks/useProfileForm';
import type { ProfileSchema } from '@/services/profile/profile.schema';
import { getProfileFieldsForRole } from '../utils/profileFieldStrategy';
import { KvImageDocUploader } from '@/components/shared/fields/KvImageDocUploader';
import { ProfileStatusBanners } from './ProfileStatusBanners';

function filterDigits(rawValue: string): string {
  return persianToEnglishDigits(rawValue).replace(/\D/g, '');
}

const PROVINCES = [
  'تهران',
  'اصفهان',
  'فارس',
  'خراسان رضوی',
  'آذربایجان شرقی',
  'کرمان',
  'خوزستان',
  'قم',
  'البرز',
  'گیلان',
] as const;

export function ProfileForm() {
  const activeUser = useUserStore((state) => state.activeUser);
  if (!activeUser) return null;
  return <ProfileFormFields activeUser={activeUser} />;
}

function ProfileFormFields({ activeUser }: { activeUser: User }) {
  const {
    form: profileForm,
    submitProfile,
    isSubmitting: isSaving,
    identityDoc,
    setIdentityDoc,
    submitError,
  } = useProfileForm();

  const isApproved = activeUser.approved;
  const docStatus = activeUser.docStatus;
  const roleFields = getProfileFieldsForRole(activeUser.role);
  const isLocked = isApproved || isSaving;
  const {
    register,
    formState: { errors },
  } = profileForm;

  return (
    <div className="space-y-kv-section text-start" dir="rtl">
      <div className="mb-kv-stack flex items-center gap-kv-pair border-b border-kv-border pb-kv-stack">
        <KvCardTitleIcon icon={faIcons.idCard} />
        <div className="min-w-0">
          <KvTypography variant="subtitle" as="h2">
            پروفایل و اسناد هویتی
          </KvTypography>
          <KvTypography variant="caption" tone="muted">
            مدیریت مشخصات پرسنلی، مدارک تحصیلی و وضعیت فعال‌سازی حساب کاربری
          </KvTypography>
        </div>
      </div>

      <ProfileStatusBanners isApproved={isApproved} docStatus={docStatus} />

      <form
        onSubmit={submitProfile}
        className="space-y-kv-section rounded-kv-card border border-kv-border/80 bg-kv-surface p-kv-inset shadow-kv-raised sm:p-kv-page"
        noValidate
      >
        <div className="flex items-center justify-between border-b border-kv-border-muted pb-3">
          <KvTypography variant="subtitle" as="h3">
            مشخصات پرسنلی، تحصیلی و مدارک هویتی
          </KvTypography>
          {isApproved && (
            <FaIcon icon={faIcons.lock} size="xs" className="text-kv-text-faint" />
          )}
        </div>

        <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2">
          <KvTextField
            label="نام"
            required
            error={errors.firstName?.message}
            locked={isLocked}
            placeholder="مثال: امیرحسین"
            {...register('firstName')}
          />
          <KvTextField
            label="نام خانوادگی"
            required
            error={errors.lastName?.message}
            locked={isLocked}
            placeholder="مثال: کریمی"
            {...register('lastName')}
          />

          <KvMobileNumberField
            value={activeUser.mobile}
            locked
            showLockIcon
          />

          <Controller
            control={profileForm.control}
            name="province"
            render={({ field }) => (
              <KvSelectField
                label="استان"
                required
                locked={isLocked}
                showLockIcon={isLocked}
                error={errors.province?.message}
                placeholder="انتخاب استان"
                value={field.value || ''}
                onValueChange={field.onChange}
              >
                {PROVINCES.map((province) => (
                  <KvSelectItem key={province} value={province}>
                    {province}
                  </KvSelectItem>
                ))}
              </KvSelectField>
            )}
          />

          {roleFields.map((field) => {
            const fieldError = (
              errors as Record<string, { message?: string } | undefined>
            )[field.key]?.message;
            const digitsOnly = field.inputMode === 'numeric';

            return (
              <Controller
                key={field.key}
                control={profileForm.control}
                name={field.key as FieldPath<ProfileSchema>}
                render={({ field: rhfField }) => (
                  <KvTextField
                    label={field.label}
                    required={field.required}
                    error={fieldError}
                    locked={isLocked}
                    placeholder={field.placeholder}
                    type={digitsOnly ? 'tel' : 'text'}
                    inputMode={field.inputMode}
                    dir={digitsOnly ? 'ltr' : undefined}
                    name={rhfField.name}
                    onBlur={rhfField.onBlur}
                    ref={rhfField.ref}
                    value={
                      digitsOnly
                        ? toPersianDigits(rhfField.value ?? '')
                        : (rhfField.value ?? '')
                    }
                    onChange={
                      digitsOnly
                        ? (event: ChangeEvent<HTMLInputElement>) => {
                            rhfField.onChange(filterDigits(event.target.value));
                          }
                        : rhfField.onChange
                    }
                  />
                )}
              />
            );
          })}
        </div>

          <div className="border-t border-kv-border-muted pt-kv-group">
          <KvImageDocUploader
            value={identityDoc}
            onChange={setIdentityDoc}
            disabled={isLocked}
            optionalHint
            label="بارگذاری مدرک هویتی (کارت دانشجویی / گواهی اشتغال)"
            description="بارگذاری مدرک اختیاری است و مانع ثبت اطلاعات هویتی نمی‌شود."
            helperText="PNG, JPG تا ۱۰ مگابایت"
            previewAlt="پیش‌نمایش مدرک ارسالی"
          />
        </div>

        {submitError && (
          <KvTypography variant="error" tone="danger" as="p">
            {submitError}
          </KvTypography>
        )}

        <div className="flex justify-end border-t border-kv-border-muted pt-kv-group">
          <KvButton
            type="submit"
            color="cta"
            appearance="solid"
            loading={isSaving}
            disabled={isApproved}
          >
            {isSaving ? 'در حال ارسال...' : 'ثبت و ارسال نهایی مشخصات'}
          </KvButton>
        </div>
      </form>
    </div>
  );
}

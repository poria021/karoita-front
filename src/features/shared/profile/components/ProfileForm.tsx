'use client';

import { IdCard, Lock } from 'lucide-react';
import { Controller, type FieldPath } from 'react-hook-form';
import type { ChangeEvent } from 'react';

import { KvButton } from '@/components/shared/KvButton';
import { KvSelectItem } from '@/components/shared/KvSelect';
import { KvSelectField } from '@/components/shared/KvSelectField';
import { KvMobileNumberField } from '@/components/shared/KvMobileNumberField';
import { KvTextField } from '@/components/shared/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
import { useUserStore } from '@/store/useUserStore';
import type { User } from '@/types/auth';
import { persianToEnglishDigits } from '@/utils/persianDigits';

import { useProfileForm } from '../hooks/useProfileForm';
import type { ProfileSchema } from '../schemas/profile.schema';
import { getProfileFieldsForRole } from '../utils/profileFieldStrategy';
import { IdentityDocUploader } from './IdentityDocUploader';
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
      <div className="mb-kv-stack flex items-center gap-kv-inline border-b border-slate-200 pb-kv-stack">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-kv-control bg-brand-500/10 text-brand-600">
          <IdCard className="size-5" />
        </div>
        <div className="flex flex-col">
          <KvTypography variant="title" as="h2">
            پروفایل و اسناد هویتی
          </KvTypography>
          <div className="mt-1">
            <KvTypography variant="caption" tone="muted">
              مدیریت مشخصات پرسنلی، مدارک تحصیلی و وضعیت فعال‌سازی حساب کاربری
            </KvTypography>
          </div>
        </div>
      </div>

      <ProfileStatusBanners isApproved={isApproved} docStatus={docStatus} />

      <form
        onSubmit={submitProfile}
        className="space-y-kv-section rounded-kv-card border border-slate-200/80 bg-white p-kv-inset shadow-sm sm:p-kv-page"
        noValidate
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <KvTypography variant="subtitle" as="h3">
            مشخصات پرسنلی، تحصیلی و مدارک هویتی
          </KvTypography>
          {isApproved && <Lock className="size-4 text-slate-400" />}
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
            const registration = register(
              field.key as FieldPath<ProfileSchema>
            );
            const digitsOnly = field.inputMode === 'numeric';

            return (
              <KvTextField
                key={field.key}
                label={field.label}
                required={field.required}
                error={fieldError}
                locked={isLocked}
                placeholder={field.placeholder}
                type={digitsOnly ? 'tel' : 'text'}
                inputMode={field.inputMode}
                name={registration.name}
                onBlur={registration.onBlur}
                ref={registration.ref}
                onChange={
                  digitsOnly
                    ? (event: ChangeEvent<HTMLInputElement>) => {
                        event.target.value = filterDigits(event.target.value);
                        void registration.onChange(event);
                      }
                    : registration.onChange
                }
              />
            );
          })}
        </div>

          <div className="border-t border-slate-100 pt-kv-group">
          <IdentityDocUploader
            value={identityDoc}
            onChange={setIdentityDoc}
            disabled={isLocked}
            label="بارگذاری مدرک هویتی (کارت دانشجویی / گواهی اشتغال)"
          />
        </div>

        {submitError && (
          <KvTypography variant="error" tone="danger" as="p">
            {submitError}
          </KvTypography>
        )}

        <div className="flex justify-end border-t border-slate-100 pt-kv-group">
          <KvButton
            type="submit"
            color="cta"
            appearance="solid"
            disabled={isLocked}
          >
            {isSaving ? 'در حال ارسال...' : 'ثبت و ارسال نهایی مشخصات'}
          </KvButton>
        </div>
      </form>
    </div>
  );
}

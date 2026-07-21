'use client';

import { Controller } from 'react-hook-form';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';
import { KvPasswordField } from '@/components/shared/fields/KvPasswordField';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
import { faIcons } from '@/utils/iconMap';

import { ORG_ACCOUNT_ROLE_OPTIONS } from '../constants';
import { useAdminUserCreationForm } from '../hooks/useAdminUserCreationForm';
import { AdminUserCreationOrgFields } from './AdminUserCreationOrgFields';

function mobileHint(args: {
  mobile: string;
  mobileComplete: boolean;
  mobileDuplicate: boolean;
  checkingMobile: boolean;
}): { hint?: string; error?: string } {
  if (!args.mobile) {
    return { hint: 'لطفاً شماره ۱۰ رقمی بدون صفر اول را وارد کنید.' };
  }
  if (args.checkingMobile) {
    return { hint: 'در حال بررسی تکراری نبودن شماره…' };
  }
  if (args.mobileDuplicate) {
    return {
      error: 'خطا: این شماره موبایل قبلاً در سیستم ثبت شده است!',
    };
  }
  if (args.mobileComplete) {
    return { hint: 'شماره موبایل معتبر است.' };
  }
  return { hint: 'لطفاً شماره ۱۰ رقمی بدون صفر اول را وارد کنید.' };
}

export function AdminUserCreationForm() {
  const page = useAdminUserCreationForm();
  const {
    register,
    control,
    formState: { errors },
  } = page.form;

  const mobileFeedback = mobileHint({
    mobile: page.mobile,
    mobileComplete: page.mobileComplete,
    mobileDuplicate: page.mobileDuplicate,
    checkingMobile: page.checkingMobile,
  });

  const passwordHint =
    page.password.trim().length >= 4
      ? 'رمز عبور معتبر است.'
      : 'رمز عبور الزامی است (حداقل ۴ کاراکتر).';

  return (
    <KvCard className="mx-auto w-full max-w-xl">
      <KvCardContent padding="md" className="space-y-kv-group">
        <div className="flex items-center gap-2.5 border-b border-kv-border pb-kv-pair">
          <div className="flex size-9 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand">
            <FaIcon icon={faIcons.userPlus} size="sm" />
          </div>
          <div>
            <KvTypography variant="subtitle" as="h3">
              ایجاد حساب کاربری جدید
            </KvTypography>
            <KvTypography variant="caption" tone="muted">
              ثبت دستی حساب کاربری همراه با فیلدهای انتساب نقش داینامیک
            </KvTypography>
          </div>
        </div>

        {page.optionsError ? (
          <KvAlert
            variant="error"
            title="بارگذاری گزینه‌های سازمانی ناموفق بود"
            description={page.optionsError}
          />
        ) : null}

        <form className="space-y-kv-group" onSubmit={page.onSubmit} noValidate>
          <div className="grid grid-cols-1 gap-x-kv-group gap-y-kv-field sm:grid-cols-2">
            <KvTextField
              id="admin-user-first-name"
              label="نام کارشناس"
              required
              placeholder="مثال: علی"
              error={errors.firstName?.message}
              {...register('firstName')}
            />

            <KvTextField
              id="admin-user-last-name"
              label="نام خانوادگی کارشناس"
              required
              locked={!page.canEditLastName}
              placeholder="مثال: رضایی"
              error={errors.lastName?.message}
              {...register('lastName')}
            />

            <div className="sm:col-span-2">
              <Controller
                name="mobile"
                control={control}
                render={({ field }) => (
                  <KvMobileNumberField
                    id="admin-user-mobile"
                    label="شماره موبایل حساب"
                    required
                    locked={!page.canEditMobile}
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={errors.mobile?.message ?? mobileFeedback.error}
                  />
                )}
              />
              {!errors.mobile?.message && !mobileFeedback.error ? (
                <KvTypography
                  variant="caption"
                  tone={
                    page.mobileComplete && !page.mobileDuplicate
                      ? 'success'
                      : 'muted'
                  }
                  className="mt-1.5"
                >
                  {mobileFeedback.hint}
                </KvTypography>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <KvPasswordField
                    id="admin-user-password"
                    label="رمز عبور حساب کاربری"
                    required
                    locked={!page.canEditPassword}
                    placeholder="رمز عبور دلخواه را وارد کنید (حداقل ۴ کاراکتر)"
                    autoComplete="new-password"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={errors.password?.message}
                    hint={
                      errors.password?.message ? undefined : passwordHint
                    }
                  />
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <KvSelectField
                    id="admin-user-role"
                    label="نقش سازمانی کاربر"
                    required
                    disabled={!page.canEditRole}
                    placeholder="-- انتخاب نقش سازمانی حساب --"
                    value={field.value || ''}
                    onValueChange={page.onRoleChange}
                    error={errors.role?.message}
                  >
                    {ORG_ACCOUNT_ROLE_OPTIONS.map((option) => (
                      <KvSelectItem key={option.value} value={option.value}>
                        {option.label}
                      </KvSelectItem>
                    ))}
                  </KvSelectField>
                )}
              />
            </div>

            <AdminUserCreationOrgFields
              control={control}
              errors={errors}
              needsRegional={page.needsRegional}
              needsCollege={page.needsCollege}
              needsProvinceRole={page.needsProvinceRole}
              province={page.province}
              city={page.city}
              loadingProvinces={page.loadingProvinces}
              provinces={page.provinces}
              cities={page.cities}
              colleges={page.colleges}
              districts={page.districts}
              onProvinceChange={page.onProvinceChange}
              onCityChange={page.onCityChange}
            />
          </div>

          <div className="flex justify-end border-t border-kv-border pt-kv-pair">
            <KvButton
              type="submit"
              color="cta"
              size="md"
              loading={page.submitting}
              disabled={page.mobileDuplicate || page.checkingMobile}
              icon={<FaIcon icon={faIcons.userPlus} size="xs" />}
            >
              ثبت و ایجاد حساب کاربری
            </KvButton>
          </div>
        </form>
      </KvCardContent>
    </KvCard>
  );
}

'use client';

import { Controller } from 'react-hook-form';
import dynamic from 'next/dynamic';

import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvCardTitleIcon } from '@/components/shared/KvCardTitleIcon';
import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';
import { KvPasswordField } from '@/components/shared/fields/KvPasswordField';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
import { faIcons } from '@/utils/iconMap';

const KvPasswordStrengthIndicator = dynamic(
  () =>
    import('@/components/shared/fields/KvPasswordStrengthIndicator').then(
      (mod) => ({ default: mod.KvPasswordStrengthIndicator })
    ),
  { ssr: false }
);

import { ORG_ACCOUNT_ROLE_OPTIONS } from '../constants';
import type { useAdminUserCreationForm } from '../hooks/useAdminUserCreationForm';
import { AdminUserCreationOrgFields } from './AdminUserCreationOrgFields';

const MOBILE_DUPLICATE_ERROR =
  'این شماره موبایل قبلاً در سیستم ثبت شده است.';

type AdminUserCreationFormProps = {
  page: ReturnType<typeof useAdminUserCreationForm>;
};

export function AdminUserCreationForm({ page }: AdminUserCreationFormProps) {
  const {
    control,
    formState: { errors },
  } = page.form;

  const mobileError =
    errors.mobile?.message ??
    (page.mobileDuplicate ? MOBILE_DUPLICATE_ERROR : undefined);

  return (
    <KvCard
      dir="rtl"
      className="mx-auto w-full max-w-xl gap-0 border-kv-border py-0 shadow-kv-raised"
    >
      <KvCardContent className="space-y-kv-section p-kv-inset sm:p-kv-block">
        <div className="flex items-center gap-kv-pair border-b border-kv-border pb-kv-inline">
          <KvCardTitleIcon icon={faIcons.userPlus} />
          <div className="min-w-0">
            <KvTypography variant="subtitle" as="h4">
              ایجاد حساب کاربری جدید
            </KvTypography>
            <KvTypography variant="caption" tone="muted">
              ثبت دستی حساب کاربری همراه با فیلدهای انتساب نقش داینامیک
            </KvTypography>
          </div>
        </div>

        <form
          className="space-y-kv-section"
          onSubmit={page.onSubmit}
          noValidate
        >
          <div className="grid grid-cols-1 gap-kv-group text-start sm:grid-cols-2">
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <KvTextField
                  id="admin-user-first-name"
                  label="نام کارشناس"
                  required
                  placeholder="مثال: علی"
                  error={errors.firstName?.message}
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value}
                  scriptGuard="persian-name"
                  onChange={(event) => {
                    field.onChange(event.target.value);
                  }}
                />
              )}
            />

            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <KvTextField
                  id="admin-user-last-name"
                  label="نام خانوادگی کارشناس"
                  required
                  placeholder="مثال: رضایی"
                  error={errors.lastName?.message}
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value}
                  scriptGuard="persian-name"
                  onChange={(event) => {
                    field.onChange(event.target.value);
                  }}
                />
              )}
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
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    error={mobileError}
                  />
                )}
              />
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
                    placeholder="رمز عبور دلخواه را وارد کنید (حداقل ۸ کاراکتر)"
                    autoComplete="new-password"
                    defaultVisible
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    error={errors.password?.message}
                    footer={
                      <KvPasswordStrengthIndicator password={field.value} />
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
                    placeholder="-- انتخاب نقش سازمانی حساب --"
                    value={field.value || ''}
                    onValueChange={page.onRoleChange}
                    ref={field.ref}
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
              onProvinceChange={page.onProvinceChange}
              onCityChange={page.onCityChange}
            />
          </div>

          <div className="mt-kv-group flex justify-end border-t border-kv-border pt-kv-group">
            <KvButton
              type="submit"
              color="cta"
              size="md"
              loading={page.submitting}
              disabled={page.mobileDuplicate || page.checkingMobile}
            >
              ثبت و ایجاد حساب کاربری
            </KvButton>
          </div>
        </form>
      </KvCardContent>
    </KvCard>
  );
}

'use client';

import { Controller } from 'react-hook-form';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
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
    register,
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

        {page.optionsError ? (
          <KvAlert
            variant="error"
            title="بارگذاری گزینه‌های سازمانی ناموفق بود"
            description={page.optionsError}
          />
        ) : null}

        <form
          className="space-y-kv-section"
          onSubmit={page.onSubmit}
          noValidate
        >
          <div className="grid grid-cols-1 gap-kv-group text-start sm:grid-cols-2">
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
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
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
                    placeholder="رمز عبور دلخواه را وارد کنید (حداقل ۴ کاراکتر)"
                    autoComplete="new-password"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={errors.password?.message}
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
              provinces={page.provinces}
              cities={page.cities}
              colleges={page.colleges}
              districts={page.districts}
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

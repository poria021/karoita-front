'use client';

import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvForm, KvFormField } from '@/components/shared/fields/KvForm';
import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
import { useUserStore } from '@/store/useUserStore';
import type { User } from '@/types/auth';
import { FilesService } from '@/services/files.service';
import { faIcons } from '@/utils/iconMap';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

import {
  createProfileSchema,
  type ProfileSchema,
} from '@/services/profile/profile.schema';
import { ProfileService } from '@/services/profile.service';
import { DynamicRoleFields } from './DynamicRoleFields';
import { getProfileDefaultValues } from './profile-form-options';

const KvImageDocUploader = dynamic(
  () =>
    import('@/components/shared/fields/KvImageDocUploader').then(
      (m) => m.KvImageDocUploader
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 animate-pulse rounded-kv-panel border-2 border-dashed border-kv-border bg-kv-surface-muted" />
    ),
  }
);

export interface IdentityFormProps {
  activeUser: User;
  token?: string;
  disabled?: boolean;
  statusAlerts?: ReactNode;
  onSaved?: () => void;
  showDocUploader?: boolean;
  submitLabel?: string;
  autoApproveOnSave?: boolean;
}

export function IdentityForm({
  activeUser,
  token,
  disabled = false,
  statusAlerts,
  onSaved,
  showDocUploader = true,
  submitLabel = 'ثبت و ارسال نهایی اطلاعات',
  autoApproveOnSave = false,
}: IdentityFormProps) {
  const storeUser = useUserStore((state) => state.activeUser);
  const liveUser =
    storeUser && storeUser.id === activeUser.id ? storeUser : activeUser;

  const [identityDocument, setIdentityDocument] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const roleStrategy = getRoleStrategy(liveUser.role);

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(createProfileSchema(liveUser.role)),
    defaultValues: getProfileDefaultValues(liveUser),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  });

  const submit = form.handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      // مرحله ۱: اگر کاربر عکس انتخاب کرده، اول آپلود دومرحله‌ای انجام ده
      // (presigned URL بگیر → فایل رو روی S3 آپلود کن)
      let photoFileId: string | undefined;
      if (identityDocument) {
        const fileRef = await FilesService.uploadFile(identityDocument, token);
        photoFileId = fileRef.id;
      }

      // مرحله ۲: پروفایل رو به‌روزرسانی کن — اگر photoFileId داشتیم به PATCH اضافه می‌شه
      await ProfileService.updateProfile(data, token, photoFileId);

      form.reset(data);
      setIdentityDocument(null);
      setSubmitSuccess(true);
      onSaved?.();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'ذخیره اطلاعات با خطا مواجه شد. لطفاً دوباره تلاش کنید.'
      );
    }
  });

  const isBusy = form.formState.isSubmitting;

  // فرم قفل است اگر: disabled باشد، یا docStatus نه not_submitted باشد نه rejected
  // (یعنی pending_admin یا approved هر دو قفل می‌کنند)
  // استثنا: اگر autoApproveOnSave=true باشد (پنل ادمین) قفل نمی‌شود
  const isLocked =
    disabled ||
    (!autoApproveOnSave &&
      liveUser.docStatus !== 'not_submitted' &&
      liveUser.docStatus !== 'rejected');

  const statusMessage =
    liveUser.docStatus === 'approved'
      ? 'مشخصات هویتی و مدرک شما توسط مدیریت تأیید شده و قابل ویرایش نیست.'
      : 'اطلاعات شما ارسال شده و در انتظار تأیید مدیریت است؛ تا تعیین وضعیت پرونده امکان ویرایش و ارسال مجدد وجود ندارد.';

  return (
    <KvCard
      dir="rtl"
      className="w-full gap-0 border-kv-border py-0 shadow-kv-raised"
    >
      <KvCardContent className="space-y-kv-section p-kv-inset sm:p-kv-block">
        {statusAlerts ? (
          <div className="space-y-kv-inline">{statusAlerts}</div>
        ) : null}

        <KvForm {...form}>
          <form onSubmit={submit} noValidate className="space-y-kv-section">
            <fieldset className="min-w-0 border-0 p-0">
              <div className="grid grid-cols-1 gap-kv-group text-start sm:grid-cols-2">
                <KvFormField
                  control={form.control}
                  name="firstName"
                  render={({ field, fieldState }) => (
                    <KvTextField
                      label="نام"
                      required
                      locked={isLocked}
                      placeholder="مثال: امیرحسین"
                      error={fieldState.error?.message}
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={typeof field.value === 'string' ? field.value : ''}
                      scriptGuard="persian-name"
                      onChange={(event) => field.onChange(event.target.value)}
                    />
                  )}
                />
                <KvFormField
                  control={form.control}
                  name="lastName"
                  render={({ field, fieldState }) => (
                    <KvTextField
                      label="نام خانوادگی"
                      required
                      locked={isLocked}
                      placeholder="مثال: کریمی"
                      error={fieldState.error?.message}
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={typeof field.value === 'string' ? field.value : ''}
                      scriptGuard="persian-name"
                      onChange={(event) => field.onChange(event.target.value)}
                    />
                  )}
                />
                <KvMobileNumberField
                  value={liveUser.mobile}
                  locked
                  required
                />
                <KvTextField
                  label="نقش کاربر جاری"
                  value={roleStrategy.label}
                  locked
                  required
                />
                <DynamicRoleFields
                  role={liveUser.role}
                  disabled={isLocked}
                />
              </div>
            </fieldset>

            {showDocUploader ? (
              <KvImageDocUploader
                value={identityDocument}
                onChange={setIdentityDocument}
                disabled={isLocked}
                optionalHint
                label="بارگذاری مدرک هویتی"
                labelIcon={<FaIcon icon={faIcons.cloudArrowUp} size="sm" />}
                maxSizeMb={2}
                helperText="PNG، JPG تا ۲ مگابایت"
                previewAlt="پیش‌نمایش مدرک ارسالی"
              />
            ) : null}

            {submitSuccess && !submitError ? (
              <KvAlert
                variant="success"
                title="اطلاعات شما با موفقیت ذخیره و ارسال شد."
                description="پس از بررسی توسط مدیریت، وضعیت پرونده شما به‌روزرسانی خواهد شد. تا آن زمان امکان ویرایش وجود ندارد."
              />
            ) : null}
            {submitError ? (
              <KvAlert variant="error" title={submitError} />
            ) : null}

            <div className="mt-kv-group flex flex-col gap-kv-pair border-t border-kv-border pt-kv-group sm:flex-row sm:items-center sm:justify-between sm:gap-kv-group">
              {isLocked ? (
                <div
                  role="status"
                  className="flex min-w-0 flex-1 items-start gap-kv-pair text-start"
                >
                  <FaIcon
                    icon={
                      liveUser.docStatus === 'approved'
                        ? faIcons.circleCheck
                        : faIcons.circleExclamation
                    }
                    size="sm"
                    className="mt-0.5 shrink-0 text-kv-text-faint"
                    aria-hidden
                  />
                  <KvTypography variant="caption" tone="muted" weight="medium">
                    {statusMessage}
                  </KvTypography>
                </div>
              ) : (
                <div className="min-w-0 flex-1" aria-hidden="true" />
              )}
              <KvButton
                type="submit"
                color="cta"
                appearance="solid"
                loading={isBusy}
                disabled={isLocked || isBusy}
                className="shrink-0 self-end sm:self-auto"
              >
                {isBusy ? 'در حال ارسال...' : submitLabel}
              </KvButton>
            </div>
          </form>
        </KvForm>
      </KvCardContent>
    </KvCard>
  );
}
'use client';

import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KV_IMAGE_DOC_SURFACE_HEIGHT_CLASS } from '@/components/shared/fields/kvDropzoneSurface';
import { KvForm, KvFormField } from '@/components/shared/fields/KvForm';
import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
import { useUserStore } from '@/store/useUserStore';
import type { User } from '@/types/auth';
import { FilesService } from '@/services/files.service';
import { faIcons } from '@/utils/iconMap';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';
import { isMockApiMode } from '@/lib/api-mode';
import { readBlobAsDataUrl } from '@/utils/readBlobAsDataUrl';

import {
  createProfileSchema,
  type ProfileSchema,
} from '@/services/profile/profile.schema';
import { ProfileService } from '@/services/profile.service';
import { useProfileOrgFieldsSync } from '../../hooks/useProfileOrgFieldsSync';
import { getProfileFormLocks } from '../../lib/profileFormLocks';
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
      <div
        className={`${KV_IMAGE_DOC_SURFACE_HEIGHT_CLASS} w-full rounded-kv-control border-2 border-dashed border-kv-border bg-kv-surface`}
      />
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

  // فایل compressed برای آپلود + فایل اصلی برای ارسال اسم معتبر به Nest
  const [identityDocument, setIdentityDocument] = useState<File | null>(null);
  const [originalDocument, setOriginalDocument] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const roleStrategy = getRoleStrategy(liveUser.role);

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(createProfileSchema(liveUser.role)),
    defaultValues: getProfileDefaultValues(liveUser),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  });

  // وقتی liveUser از store آپدیت میشه (مثلاً بعد از Zustand hydration یا بعد از save موفق)، فقط فیلدهای
  // سازمانی رو با setValue آپدیت کن (نه form.reset کامل) تا تایپ کاربر دست نخورد — جزئیات
  // در useProfileOrgFieldsSync.ts.
  useProfileOrgFieldsSync(form, liveUser);

  const submit = form.handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      if (isMockApiMode()) {
        // ─── Mock mode: عکس رو به base64 تبدیل کن و مستقیم در mock user ذخیره کن
        // FilesService در mock کار نمی‌کنه (requireNestTransport throw می‌کنه)
        if (identityDocument) {
          const base64 = await readBlobAsDataUrl(identityDocument);
          await ProfileService.updateIdentityDocument(base64, token);
        }
        await ProfileService.updateProfile(data, token);
      } else {
        // ─── Real mode: آپلود دومرحله‌ای به S3
        let photoFileId: string | undefined;
        let photoPublicUrl: string | undefined;
        if (identityDocument) {
          const fileRef = await FilesService.uploadFile(
            identityDocument,
            token,
            originalDocument ?? undefined
          );
          photoFileId = fileRef.id;
          photoPublicUrl = fileRef.path;
        }
        await ProfileService.updateProfile(
          data,
          token,
          photoFileId,
          photoPublicUrl
        );
      }

      // باکت S3 برای GET عمومی بسته است؛ پیش‌نمایش قفل‌شدهٔ خود کاربر
      // باید از همان فایل انتخاب‌شده بماند، نه از URL ذخیره‌سازی.
      if (identityDocument) {
        const preview = await readBlobAsDataUrl(identityDocument);
        const active = useUserStore.getState().activeUser;
        if (active) {
          useUserStore.getState().setUser({ ...active, docUrl: preview });
        }
      }

      form.reset(data);
      setIdentityDocument(null);
      setOriginalDocument(null);
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
  const hasUnsavedChanges =
    form.formState.isDirty || Boolean(identityDocument);
  const locks = getProfileFormLocks({
    disabled,
    autoApproveOnSave,
    docStatus: liveUser.docStatus,
    hasUnsavedChanges,
  });

  const statusMessage = locks.accountApproved
    ? 'نام، نام خانوادگی، رشته، کد شناسایی و مدرک هویتی پس از تأیید قابل ویرایش نیست. استان، منطقه، شهر، مدرسه یا دانشگاه را می‌توانید ذخیره کنید؛ این تغییر به صف تأیید مدیر ارشد برنمی‌گردد.'
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
                      locked={locks.identityLocked}
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
                      locked={locks.identityLocked}
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
                  section="identifiers"
                  identifierLocked={locks.identityLocked}
                />
                <DynamicRoleFields
                  role={liveUser.role}
                  section="organization"
                  organizationLocked={locks.organizationLocked}
                  identifierLocked={locks.identityLocked}
                />
              </div>
            </fieldset>

            {showDocUploader ? (
              <KvImageDocUploader
                value={identityDocument}
                existingUrl={liveUser.docUrl ?? null}
                onChange={(file, original) => {
                  setIdentityDocument(file);
                  setOriginalDocument(file ? (original ?? file) : null);
                }}
                disabled={locks.identityLocked}
                optionalHint
                compress={false}
                framed={false}
                previewFit="cover"
                label={
                  locks.identityLocked
                    ? 'مدرک هویتی'
                    : 'بارگذاری مدرک هویتی'
                }
                maxSizeMb={2}
                helperText="PNG، JPG تا ۲ مگابایت"
                previewAlt="پیش‌نمایش مدرک ارسالی"
              />
            ) : null}

            {submitError ? (
              <KvAlert variant="error" title={submitError} />
            ) : null}

            <div className="mt-kv-group flex flex-col gap-kv-pair border-t border-kv-border pt-kv-group sm:flex-row sm:items-center sm:justify-between sm:gap-kv-group">
              {locks.awaitingAdminReview || locks.accountApproved ? (
                <div
                  role="status"
                  className="flex min-w-0 flex-1 items-start gap-kv-pair text-start"
                >
                  <FaIcon
                    icon={
                      locks.accountApproved
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
                disabled={locks.submitLocked || isBusy}
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

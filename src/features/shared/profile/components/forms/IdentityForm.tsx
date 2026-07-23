'use client';

import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvForm } from '@/components/shared/fields/KvForm';
import { KvImageDocUploader } from '@/components/shared/fields/KvImageDocUploader';
import { KvMobileNumberField } from '@/components/shared/fields/KvMobileNumberField';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
import { useUserStore } from '@/store/useUserStore';
import type { User } from '@/types/auth';
import { fileToDataUrl } from '@/utils/compressor';
import { faIcons } from '@/utils/iconMap';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

import {
  createProfileSchema,
  type ProfileSchema,
} from '@/services/profile/profile.schema';
import { ProfileService } from '@/services/profile.service';
import { DynamicRoleFields } from './DynamicRoleFields';
import { getProfileDefaultValues } from './profile-form-options';

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

function isIdentityProfileLocked(user: User, lockAfterSubmit: boolean): boolean {
  if (!lockAfterSubmit) return false;
  return user.docStatus !== 'not_submitted' && user.docStatus !== 'rejected';
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
  const [docError, setDocError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const roleStrategy = getRoleStrategy(liveUser.role);
  const requireIdentityDoc = showDocUploader && !autoApproveOnSave;
  const form = useForm<ProfileSchema>({
    resolver: zodResolver(createProfileSchema(liveUser.role)),
    defaultValues: getProfileDefaultValues(liveUser),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const submit = form.handleSubmit(async (data) => {
    setSubmitError(null);
    setDocError(null);

    if (requireIdentityDoc && !identityDocument) {
      setDocError('بارگذاری مدرک هویتی برای ارسال به تأیید مدیریت الزامی است.');
      return;
    }

    try {
      let documentBase64: string | undefined;
      if (identityDocument) {
        documentBase64 = await fileToDataUrl(identityDocument);
      }

      // Form is created with createProfileSchema(liveUser.role); role stays on `data`.
      await ProfileService.updateProfile(data, token);
      if (documentBase64) {
        await ProfileService.updateIdentityDocument(documentBase64, token);
      }

      form.reset(data);
      setIdentityDocument(null);
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
  const isProfileLocked =
    disabled || isIdentityProfileLocked(liveUser, !autoApproveOnSave);
  const isDisabled = isProfileLocked || isBusy;

  return (
    <KvCard
      dir="rtl"
      className="w-full gap-0 border-kv-border py-0 shadow-kv-raised"
    >
      <KvCardContent className="space-y-kv-section p-kv-inset sm:p-kv-block">
        <div className="flex items-center gap-kv-pair border-b border-kv-border pb-kv-inline">
          <FaIcon
            icon={faIcons.idCard}
            size="sm"
            className="shrink-0 text-kv-brand-soft-fg"
          />
          <KvTypography variant="label">
            مشخصات کاربر
          </KvTypography>
        </div>

        {statusAlerts ? (
          <div className="space-y-kv-inline">{statusAlerts}</div>
        ) : null}

        <KvForm {...form}>
          <form onSubmit={submit} noValidate className="space-y-kv-section">
            <div className="rounded-kv-panel border border-kv-border p-kv-group shadow-kv-raised">
              <fieldset
                disabled={isDisabled}
                className="min-w-0 border-0 p-0 disabled:opacity-100"
              >
                <div className="grid grid-cols-1 gap-kv-group text-start sm:grid-cols-2">
                  <KvTextField
                    label="نام"
                    required
                    locked={isDisabled}
                    placeholder="مثال: امیرحسین"
                    error={form.formState.errors.firstName?.message}
                    {...form.register('firstName')}
                  />
                  <KvTextField
                    label="نام خانوادگی"
                    required
                    locked={isDisabled}
                    placeholder="مثال: کریمی"
                    error={form.formState.errors.lastName?.message}
                    {...form.register('lastName')}
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
                    disabled={isDisabled}
                  />
                </div>
              </fieldset>
            </div>

            {showDocUploader ? (
              <KvImageDocUploader
                value={identityDocument}
                onChange={(file) => {
                  setIdentityDocument(file);
                  if (file) setDocError(null);
                }}
                disabled={isDisabled}
                optionalHint={!requireIdentityDoc}
                label="بارگذاری مدرک هویتی"
                labelIcon={
                  <FaIcon icon={faIcons.cloudArrowUp} size="sm" />
                }
                helperText="PNG, JPG تا ۱۰ مگابایت"
                previewAlt="پیش‌نمایش مدرک ارسالی"
                error={docError ?? undefined}
              />
            ) : null}

            {submitError ? (
              <KvAlert variant="error" title={submitError} />
            ) : null}

            <div className="mt-kv-group flex flex-col gap-kv-pair border-t border-kv-border pt-kv-group sm:flex-row sm:items-center sm:justify-between sm:gap-kv-group">
              {isProfileLocked ? (
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
                  <KvTypography
                    variant="caption"
                    tone="muted"
                    weight="medium"
                  >
                    {liveUser.docStatus === 'approved'
                      ? 'اطلاعات شما توسط مدیریت تأیید شده است؛ امکان ویرایش و ارسال مجدد وجود ندارد.'
                      : 'اطلاعات شما ارسال شده و در انتظار تأیید مدیریت است؛ تا تعیین وضعیت پرونده امکان ویرایش و ارسال مجدد وجود ندارد.'}
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
                disabled={isProfileLocked}
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

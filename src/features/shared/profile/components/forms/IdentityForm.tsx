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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const roleStrategy = getRoleStrategy(liveUser.role);
  const form = useForm<ProfileSchema>({
    resolver: zodResolver(createProfileSchema(liveUser.role)),
    defaultValues: getProfileDefaultValues(liveUser),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const submit = form.handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      await ProfileService.updateProfile(data, token);
      if (identityDocument) {
        const documentBase64 = await fileToDataUrl(identityDocument);
        await ProfileService.updateIdentityDocument(documentBase64, token);
      }

      form.reset(data);
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
      className="mx-auto w-full max-w-4xl gap-0 border-kv-border py-0 shadow-kv-raised"
    >
      <KvCardContent className="space-y-kv-section p-kv-inset sm:p-kv-block">
        <div className="flex items-center justify-between border-b border-kv-border pb-kv-inline">
          <div className="flex items-center gap-kv-pair">
            <FaIcon
              icon={faIcons.idCard}
              size="sm"
              className="shrink-0 text-kv-brand-soft-fg"
            />
            <div className="flex items-center gap-kv-field">
              <KvTypography variant="caption" tone="muted" weight="bold">
                نقش کاربری: {roleStrategy.label}
              </KvTypography>
              {isProfileLocked ? (
                <FaIcon
                  icon={faIcons.lock}
                  size="xs"
                  className="text-kv-text-faint"
                />
              ) : null}
            </div>
          </div>
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
                onChange={setIdentityDocument}
                disabled={isDisabled}
                optionalHint
                label="بارگذاری مدرک هویتی"
                description="بارگذاری مدرک اختیاری است و مانع ثبت اطلاعات هویتی نمی‌شود."
                helperText="PNG, JPG تا ۱۰ مگابایت"
                previewAlt="پیش‌نمایش مدرک ارسالی"
              />
            ) : null}

            {submitError ? (
              <KvAlert variant="error" title={submitError} />
            ) : null}

            <div className="mt-kv-group flex flex-col items-end gap-kv-pair border-t border-kv-border pt-kv-group">
              {isProfileLocked ? (
                <div role="status">
                  <KvTypography
                    variant="caption"
                    tone="muted"
                    weight="medium"
                  >
                    اطلاعات شما در حال بررسی یا تأیید شده است؛ تا تعیین وضعیت
                    پرونده امکان ویرایش و ارسال مجدد وجود ندارد.
                  </KvTypography>
                </div>
              ) : null}
              <KvButton
                type="submit"
                color="cta"
                appearance="solid"
                loading={isBusy}
                disabled={isProfileLocked}
                icon={
                  <FaIcon
                    icon={faIcons.arrowLeft}
                    size="sm"
                    className="rtl:rotate-180"
                  />
                }
                iconPosition="end"
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

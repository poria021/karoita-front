'use client';

import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvForm } from '@/components/shared/fields/KvForm';
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
} from '../../schemas/profile.schema';
import { ProfileService } from '../../services/profile.service';
import { IdentityDocUploader } from '../IdentityDocUploader';
import { DynamicRoleFields } from './DynamicRoleFields';
import { getProfileDefaultValues } from './profile-form-options';

export interface IdentityFormProps {
  activeUser: User;
  token?: string;
  disabled?: boolean;
  /** Status alerts rendered inside the card (original-karvita.html). */
  statusAlerts?: ReactNode;
  onSaved?: () => void;
  showDocUploader?: boolean;
  submitLabel?: string;
  /** When true, save marks approved without pending_admin (e.g. super_admin UX). */
  autoApproveOnSave?: boolean;
}

/**
 * Matches `original-karvita.html` `isProfileLocked` for roles that lock after submit.
 * Lock policy is passed from ProfileContainer strategy (no inline role checks).
 */
function isIdentityProfileLocked(user: User, lockAfterSubmit: boolean): boolean {
  if (!lockAfterSubmit) return false;
  return user.docStatus !== 'not_submitted' && user.docStatus !== 'rejected';
}

/**
 * Identity form — layout mirrors original-karvita.html:
 * outer card → section header → alerts → fields box → upload box → submit.
 */
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
        // Uploader already compressed to WebP — do not compress again.
        const documentBase64 = await fileToDataUrl(identityDocument);
        await ProfileService.updateIdentityDocument(documentBase64, token);
      }

      const current = useUserStore.getState().activeUser;
      if (current) {
        useUserStore.getState().setUser({
          ...current,
          ...data,
          approved: autoApproveOnSave,
          docStatus: autoApproveOnSave ? 'approved' : 'pending_admin',
        });
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
      <KvCardContent className="space-y-6 p-5 sm:p-7">
        <div className="flex items-center justify-between border-b border-kv-border pb-3">
          <div className="flex items-center gap-2">
            <FaIcon
              icon={faIcons.idCard}
              size="sm"
              className="shrink-0 text-kv-brand-soft-fg"
            />
            <div className="flex items-center gap-1.5">
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
          <div className="space-y-3">{statusAlerts}</div>
        ) : null}

        <KvForm {...form}>
          <form onSubmit={submit} noValidate className="space-y-6">
            {/* Fields panel — no title (title lives on card header) */}
            <div className="rounded-kv-panel border border-kv-border p-4 shadow-sm">
              <fieldset
                disabled={isDisabled}
                className="min-w-0 border-0 p-0 disabled:opacity-100"
              >
                <div className="grid grid-cols-1 gap-4 text-start sm:grid-cols-2">
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
              <IdentityDocUploader
                value={identityDocument}
                onChange={setIdentityDocument}
                disabled={isDisabled}
                helperText="PNG, JPG تا ۱۰ مگابایت"
              />
            ) : null}

            {submitError ? (
              <p
                role="alert"
                className="rounded-kv-panel border border-kv-danger-border bg-kv-danger-soft p-3 text-xs font-bold text-kv-danger-soft-fg"
              >
                {submitError}
              </p>
            ) : null}

            <div className="mt-4 flex flex-col items-end gap-2 border-t border-kv-border pt-4">
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

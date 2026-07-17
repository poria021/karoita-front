'use client';

import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvForm } from '@/components/shared/KvForm';
import { KvMobileNumberField } from '@/components/shared/KvMobileNumberField';
import { KvTextField } from '@/components/shared/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
import { useUserStore } from '@/store/useUserStore';
import type { User } from '@/types/auth';
import { compressImageToBase64 } from '@/utils/compressor';
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
}

/**
 * Matches `original-karvita.html` `isProfileLocked`:
 * locked when status is neither `not_submitted` nor `rejected`.
 */
function isIdentityProfileLocked(user: User): boolean {
  if (user.role === 'super_admin') return false;
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
        const documentBase64 = await compressImageToBase64(identityDocument);
        await ProfileService.updateIdentityDocument(documentBase64, token);
      }

      const current = useUserStore.getState().activeUser;
      if (current) {
        const isSuperAdmin = current.role === 'super_admin';
        useUserStore.getState().setUser({
          ...current,
          ...data,
          approved: isSuperAdmin,
          docStatus: isSuperAdmin ? 'approved' : 'pending_admin',
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
  const isProfileLocked = disabled || isIdentityProfileLocked(liveUser);
  const isDisabled = isProfileLocked || isBusy;
  const showDocUploader = liveUser.role !== 'super_admin';
  const submitLabel =
    liveUser.role === 'super_admin'
      ? 'ذخیره تغییرات مشخصات سیستم'
      : 'ثبت و ارسال نهایی اطلاعات';

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

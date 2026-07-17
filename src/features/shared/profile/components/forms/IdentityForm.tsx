'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvForm } from '@/components/shared/KvForm';
import { KvMobileNumberField } from '@/components/shared/KvMobileNumberField';
import { KvTextField } from '@/components/shared/KvTextField';
import type { User } from '@/types/auth';
import { compressImageToBase64 } from '@/utils/compressor';
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
  onSaved?: () => void;
}

/** Adaptive RTL identity form backed by the polymorphic profile schema. */
export function IdentityForm({
  activeUser,
  token,
  disabled = false,
  onSaved,
}: IdentityFormProps) {
  const [identityDocument, setIdentityDocument] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const roleStrategy = getRoleStrategy(activeUser.role);
  const form = useForm<ProfileSchema>({
    resolver: zodResolver(createProfileSchema(activeUser.role)),
    defaultValues: getProfileDefaultValues(activeUser),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const submit = form.handleSubmit(async (data) => {
    setFeedback(null);
    try {
      const result = await ProfileService.updateProfile(data, token);
      if (identityDocument) {
        const documentBase64 = await compressImageToBase64(identityDocument);
        await ProfileService.updateIdentityDocument(documentBase64, token);
      }
      form.reset(data);
      setFeedback({ type: 'success', message: result.message });
      onSaved?.();
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'ذخیره اطلاعات با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
      });
    }
  });

  const isBusy = form.formState.isSubmitting;
  const isDisabled = disabled || isBusy;

  return (
    <KvCard dir="rtl" className="w-full">
      <KvCardContent className="pt-6">
        <KvForm {...form}>
          <form onSubmit={submit} noValidate className="space-y-kv-section">
            <section className="space-y-kv-group">
              <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2">
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
                  value={activeUser.mobile}
                  locked
                  showLockIcon
                />
                <KvTextField
                  label="نقش کاربری"
                  value={roleStrategy.label}
                  locked
                  showLockIcon
                />
              </div>
            </section>

            <section className="space-y-kv-group border-t border-slate-100 pt-kv-section">
              <div className="grid grid-cols-1 gap-kv-group sm:grid-cols-2">
                <DynamicRoleFields role={activeUser.role} disabled={isDisabled} />
              </div>
            </section>

            <section className="border-t border-slate-100 pt-kv-section">
              <IdentityDocUploader
                value={identityDocument}
                onChange={setIdentityDocument}
                disabled={isDisabled}
                helperText="JPEG یا PNG، حداکثر ۱۰ مگابایت؛ تبدیل خودکار به WebP"
              />
            </section>

            {feedback && (
              <div
                role="status"
                className={
                  feedback.type === 'success'
                    ? 'flex items-center gap-2 rounded-kv-panel border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700'
                    : 'rounded-kv-panel border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700'
                }
              >
                {feedback.type === 'success' && <CheckCircle2 className="size-4" />}
                {feedback.message}
              </div>
            )}

            <div className="flex justify-end border-t border-slate-100 pt-kv-stack">
              <KvButton
                type="submit"
                color="cta"
                appearance="solid"
                size="lg"
                loading={isBusy}
                disabled={disabled}
                icon={
                  <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
                }
                iconPosition="end"
              >
                {isBusy ? 'در حال ذخیره...' : 'ثبت و ارسال اطلاعات'}
              </KvButton>
            </div>
          </form>
        </KvForm>
      </KvCardContent>
    </KvCard>
  );
}

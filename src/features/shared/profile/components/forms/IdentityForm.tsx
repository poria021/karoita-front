'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { KvTextField } from '@/components/shared/KvTextField';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
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
    mode: 'onTouched',
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
    <Card
      dir="rtl"
      className="overflow-visible rounded-3xl border-slate-200 bg-white font-sans shadow-sm"
    >
      <CardContent className="pt-kv-section">
        <Form {...form}>
          <form onSubmit={submit} noValidate className="space-y-kv-8">
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
                <KvTextField
                  label="شماره موبایل"
                  value={activeUser.mobile}
                  locked
                  showLockIcon
                  dir="ltr"
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
                    ? 'flex items-center gap-kv-2 rounded-xl border border-emerald-200 bg-emerald-50 p-kv-3 text-xs font-bold text-emerald-700'
                    : 'rounded-xl border border-rose-200 bg-rose-50 p-kv-3 text-xs font-bold text-rose-700'
                }
              >
                {feedback.type === 'success' && <CheckCircle2 className="size-4" />}
                {feedback.message}
              </div>
            )}

            <div className="flex justify-end border-t border-slate-100 pt-kv-stack">
              <Button
                type="submit"
                size="lg"
                disabled={isDisabled || !form.formState.isValid}
                className="rounded-xl pe-6 ps-6 font-black"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    ثبت و ارسال اطلاعات
                    <ArrowLeft className="size-4 rtl:rotate-180" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

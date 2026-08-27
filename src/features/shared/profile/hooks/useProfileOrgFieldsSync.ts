'use client';

import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import type { ProfileSchema } from '@/services/profile/profile.schema';
import type { User } from '@/types/auth';

import { getProfileDefaultValues } from '../components/forms/profile-form-options';

const ORG_SYNC_FIELDS = [
  'province',
  'college',
  'district',
  'school',
  'city',
  'major',
  'studentId',
  'skillCode',
  'personalCode',
] as const;

/**
 * وقتی liveUser از store آپدیت میشه (مثلاً بعد از Zustand hydration یا بعد
 * از save موفق)، فقط فیلدهای سازمانی رو با setValue آپدیت کن (نه form.reset
 * کامل) تا تایپ در حال انجام کاربر دست نخورد.
 *
 * از IdentityForm.tsx استخراج شده تا اون فایل زیر سقف نرم ~۲۵۰-۳۰۰ خط
 * (rule 00 §7) بمونه.
 */
export function useProfileOrgFieldsSync(
  form: UseFormReturn<ProfileSchema>,
  liveUser: User
): void {
  useEffect(() => {
    const defaults = getProfileDefaultValues(liveUser);
    for (const field of ORG_SYNC_FIELDS) {
      if (!(field in defaults)) continue;
      const current = form.getValues(field as keyof ProfileSchema);
      const next = defaults[field as keyof typeof defaults];
      // فقط اگه مقدار عوض شده setValue بزن تا dirty کاذب رد نشه
      const currentStr = JSON.stringify(current);
      const nextStr = JSON.stringify(next);
      if (
        currentStr !== nextStr &&
        !form.getFieldState(field as keyof ProfileSchema).isDirty
      ) {
        form.setValue(field as keyof ProfileSchema, next as never, {
          shouldDirty: false,
          shouldValidate: false,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    liveUser.id,
    liveUser.province,
    liveUser.college,
    liveUser.district,
    liveUser.school,
    liveUser.city,
    liveUser.major,
    liveUser.studentId,
    liveUser.skillCode,
    liveUser.personalCode,
  ]);
}

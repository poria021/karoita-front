'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import type { DocStatus } from '@/types/auth';
import { faIcons } from '@/utils/iconMap';

export interface ProfileStatusAlertProps {
  approved: boolean;
  docStatus:
    | Extract<DocStatus, 'not_submitted' | 'pending_admin' | 'rejected'>
    | DocStatus;
  /** Admin rejection reason shown only when `docStatus === 'rejected'`. */
  adminRequestMessage?: string;
  /** When true, hides the success banner after the user dismisses it. */
  dismissibleApproved?: boolean;
}

/**
 * Profile status → KvAlert mapper.
 * Owns copy/status logic only; visual chrome lives in shared `KvAlert`.
 */
export function ProfileStatusAlert({
  approved,
  docStatus,
  adminRequestMessage,
  dismissibleApproved = true,
}: ProfileStatusAlertProps) {
  if (approved) {
    return (
      <KvAlert
        variant="success"
        title="احراز هویت با موفقیت انجام شد"
        description="هویت و مدارک شما با موفقیت توسط مدیریت تایید و حساب کاربری فعال گردید."
        dismissible={dismissibleApproved}
      />
    );
  }

  if (docStatus === 'rejected') {
    return (
      <KvAlert
        variant="error"
        title="پرونده شما رد شده است (نیاز به اصلاح اطلاعات و مدارک)"
        description={
          <div className="space-y-2">
            <p>
              کاربر گرامی، اسناد هویتی و مشخصات پرسنلی شما به علت مغایرت توسط
              مدیریت رد شده است. لطفاً دلیل اعلام‌شده را برطرف کرده، اطلاعات خود
              را ویرایش و مجدداً مدرک معتبر ارسال فرمایید:
            </p>
            <div className="my-1 w-full rounded-kv-panel border border-kv-danger-border bg-kv-surface p-3 text-xs font-bold text-kv-danger-soft-fg shadow-kv-raised">
              <span className="mb-0.5 block text-xs font-bold text-kv-danger">
                علت اعلام‌شده توسط مدیریت ارشد:
              </span>
              <span className="font-extrabold text-kv-text-secondary">
                {adminRequestMessage?.trim() || 'علتی ثبت نشده است.'}
              </span>
            </div>
          </div>
        }
      />
    );
  }

  if (docStatus === 'pending_admin') {
    return (
      <KvAlert
        variant="info"
        title="اطلاعات در انتظار تأیید مدیریت است"
        description="پرونده شما با موفقیت برای مدیریت ارشد ارسال گردید. حساب کاربری شما بلافاصله پس از تایید مدارک توسط مدیر ارشد فعال خواهد شد."
        icon={<FaIcon icon={faIcons.hourglassHalf} size="sm" />}
      />
    );
  }

  if (docStatus === 'not_submitted') {
    return (
      <KvAlert
        variant="warning"
        title="حساب کاربری شما غیرفعال است"
        description="جهت فعال‌سازی حساب، پر کردن مشخصات هویتی و پرسنلی (فیلدهای ستاره‌دار) الزامی است؛ لطفاً اطلاعات خود را تکمیل و ارسال فرمایید."
      />
    );
  }

  return null;
}

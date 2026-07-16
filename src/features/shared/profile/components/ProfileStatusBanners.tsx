import type { ReactNode } from 'react';
import { CircleCheck, Hourglass, TriangleAlert } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { DocStatus } from '@/types/auth';

interface ProfileStatusBannersProps {
  isApproved: boolean;
  docStatus: DocStatus;
}

export function ProfileStatusBanners({ isApproved, docStatus }: ProfileStatusBannersProps) {
  return (
    <div className="space-y-3">
      {!isApproved && docStatus === 'rejected' && (
        <StatusBanner
          tone="rose"
          icon={<TriangleAlert className="mt-0.5 size-5 shrink-0 text-rose-500" />}
          title="پرونده شما رد شده است (نیاز به اصلاح اطلاعات و مدارک)"
          body="کاربر گرامی، اسناد هویتی و مشخصات پرسنلی شما به علت مغایرت رد شده است. لطفاً مغایرت اعلام‌شده را برطرف کرده، اطلاعات خود را ویرایش و مجدداً ارسال فرمایید."
        />
      )}
      {!isApproved && docStatus === 'not_submitted' && (
        <StatusBanner
          tone="amber"
          icon={<TriangleAlert className="size-5 shrink-0 text-amber-500" />}
          title="حساب کاربری شما غیرفعال است"
          body="جهت فعال‌سازی حساب، پر کردن مشخصات هویتی و پرسنلی (فیلدهای ستاره‌دار) الزامی است؛ لطفاً اطلاعات خود را تکمیل و ارسال فرمایید."
        />
      )}
      {!isApproved && docStatus === 'pending_admin' && (
        <StatusBanner
          tone="blue"
          icon={<Hourglass className="size-5 shrink-0 text-blue-500" />}
          title="اطلاعات در انتظار تأیید مدیریت است"
          body="پرونده شما با موفقیت برای مدیریت ارشد ارسال گردید. حساب کاربری شما بلافاصله پس از تایید مدارک فعال خواهد شد."
        />
      )}
      {isApproved && (
        <StatusBanner
          tone="emerald"
          icon={<CircleCheck className="size-5 shrink-0 text-emerald-500" />}
          title="احراز هویت با موفقیت انجام شد"
          body="هویت و مدارک شما با موفقیت توسط مدیریت تایید و حساب کاربری شما فعال گردید."
        />
      )}
    </div>
  );
}

function StatusBanner({
  tone,
  icon,
  title,
  body,
}: {
  tone: 'rose' | 'amber' | 'blue' | 'emerald';
  icon: ReactNode;
  title: string;
  body: string;
}) {
  const tones = {
    rose: 'border-rose-200 bg-rose-50/60 text-rose-800',
    amber: 'border-amber-200 bg-amber-50/60 text-amber-800',
    blue: 'border-blue-200 bg-blue-50/60 text-blue-800',
    emerald: 'border-emerald-200 bg-emerald-50/60 text-emerald-800',
  } as const;
  const titleTones = {
    rose: 'text-rose-900',
    amber: 'text-amber-900',
    blue: 'text-blue-900',
    emerald: 'text-emerald-900',
  } as const;

  return (
    <div className={cn('flex items-start gap-3 rounded-2xl border p-4 shadow-sm', tones[tone])}>
      {icon}
      <div className="space-y-1.5">
        <span className={cn('mb-1 block text-xs font-bold', titleTones[tone])}>{title}</span>
        <p className="text-[11px] font-medium opacity-95">{body}</p>
      </div>
    </div>
  );
}

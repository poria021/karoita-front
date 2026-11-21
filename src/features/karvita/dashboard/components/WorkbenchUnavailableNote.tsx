import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';

/** وقتی بک‌اند ۴۰۳ بدهد (نقش کاربر به این گزارش دسترسی ندارد). */
export const WORKBENCH_FORBIDDEN_MESSAGE =
  'شما مجوز دسترسی به این گزارش را ندارید.';

/** هر خطای دیگر (شبکه، ۵۰۰، …). */
export const WORKBENCH_UNAVAILABLE_MESSAGE = 'فعلاً در دسترس نیست.';

/**
 * متن حالت خطای باکس‌های میز کار: ۴۰۳ → پیام نبودِ مجوز، وگرنه همان متن «در دسترس نیست»
 * (پیش‌فرض یا متن اختصاصی همان باکس).
 */
export function workbenchErrorText(
  forbidden: boolean | undefined,
  fallback: string = WORKBENCH_UNAVAILABLE_MESSAGE
): string {
  return forbidden ? WORKBENCH_FORBIDDEN_MESSAGE : fallback;
}

/**
 * یک خط توضیح خاکستری برای حالت خطای باکس؛ `forbidden` از `isForbiddenError(error)` هوک می‌آید.
 * باقی‌ماندهٔ ارتفاعِ باکس (زیر عنوان) را پر می‌کند و متن را هم افقی و هم عمودی وسط می‌گذارد.
 */
export function WorkbenchUnavailableNote({
  forbidden,
  className,
}: {
  forbidden?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        'flex min-h-16 min-w-0 flex-1 items-center justify-center px-kv-inset py-kv-pair text-center',
        className
      )}
    >
      <KvTypography
        variant="caption"
        tone="muted"
        as="p"
        className="leading-relaxed"
      >
        {workbenchErrorText(forbidden)}
      </KvTypography>
    </div>
  );
}

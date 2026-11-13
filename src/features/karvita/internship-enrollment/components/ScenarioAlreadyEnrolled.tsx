'use client';

import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { toPersianDigits } from '@/utils/persianDigits';

type ScenarioAlreadyEnrolledProps = {
  courseTitle: string;
  termTitle: string;
};

/**
 * سناریوی ۶ — دانشجو در زیرمجموعهٔ دیگری از همین درس کاتالوگ ثبت‌نام فعال دارد.
 * اخذ از درس‌های گروه دیگر (مثلاً test1 و test2) اینجا نمی‌آید.
 */
export function ScenarioAlreadyEnrolled({
  courseTitle,
  termTitle,
}: ScenarioAlreadyEnrolledProps) {
  const courseLabel = toPersianDigits(courseTitle);
  const termLabel = toPersianDigits(termTitle);

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-kv-card border-2 border-dashed border-kv-border bg-kv-surface-subtle/50">
      <KvEmptyState
        tone="muted"
        title="در زیرمجموعهٔ دیگری از این درس انتخاب واحد کرده‌اید"
        description={`شما هم‌اکنون در «${courseLabel}» برای نیم‌سال «${termLabel}» ثبت‌نام فعال دارید. تا پایان یا تعیین تکلیف همان زیرمجموعه، امکان اخذ زیرمجموعهٔ دیگر از همین درس وجود ندارد. از منوی سایدبار به همان مورد مراجعه کنید؛ اخذ درس‌های گروه دیگر مانعی ندارد.`}
      />
    </div>
  );
}

'use client';

import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { toPersianDigits } from '@/utils/persianDigits';

type ScenarioAlreadyEnrolledProps = {
  courseTitle: string;
  termTitle: string;
};

/**
 * سناریوی ۶ — کاربر در درس دیگری از همین نیم‌سال انتخاب واحد کرده
 * و نباید دوباره وارد جریان اخذ واحد این ماژول شود.
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
        title="در درس دیگری انتخاب واحد کرده‌اید"
        description={`شما هم‌اکنون در «${courseLabel}» برای نیم‌سال «${termLabel}» ثبت‌نام فعال دارید. تا پایان یا تعیین تکلیف همان درس، امکان شروع فعالیت و انتخاب واحد در این ماژول وجود ندارد. لطفاً از منوی سایدبار به همان درس مراجعه کنید.`}
      />
    </div>
  );
}

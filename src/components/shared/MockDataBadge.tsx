import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type MockDataBadgeProps = {
  className?: string;
};

/** بج قرمز برای سطح‌هایی که هنوز دادهٔ Nest ندارند و از ماکت می‌خوانند. */
export function MockDataBadge({ className }: MockDataBadgeProps) {
  return (
    <Badge variant="danger" className={cn(className)}>
      ماکت
    </Badge>
  );
}

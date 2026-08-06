import { Badge } from '@/components/ui/badge';
import type { DailyApprovalTrainee } from '@/types/daily-approvals';
import { toPersianDigits } from '@/utils/persianDigits';

export function DailyApprovalUnreadBadge({
  trainee,
}: {
  trainee: DailyApprovalTrainee;
}) {
  if (trainee.status === 'dropped') {
    return <Badge variant="danger">اخراج شده</Badge>;
  }
  if (!trainee.hasSubmitted) {
    return <Badge variant="default">بدون ارسال</Badge>;
  }
  if (trainee.unreadCount > 0) {
    return (
      <Badge variant="warning">
        {`${toPersianDigits(trainee.unreadCount)} گزارش`}
      </Badge>
    );
  }
  return <Badge variant="success">خوانده شده</Badge>;
}

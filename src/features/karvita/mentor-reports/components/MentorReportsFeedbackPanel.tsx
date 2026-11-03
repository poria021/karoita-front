'use client';

import { KvCard, KvCardContent, KvCardHeader, KvCardTitle } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import type { MentorTeacherFeedbackItem } from '@/types/mentor-teacher-reports';

export function MentorReportsFeedbackPanel({
  items,
}: {
  items: MentorTeacherFeedbackItem[];
}) {
  return (
    <KvCard>
      <KvCardHeader bordered className="px-kv-group py-kv-group">
        <KvCardTitle>بازخوردهای اخیر</KvCardTitle>
      </KvCardHeader>
      <KvCardContent className="space-y-kv-group p-kv-group">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-kv-control border border-kv-border bg-kv-surface-subtle p-kv-group"
          >
            <div className="mb-kv-pair flex items-start justify-between gap-kv-pair">
              <KvTypography variant="subtitle" as="h3">
                {item.title}
              </KvTypography>
              <KvTypography variant="caption" tone="muted" as="span">
                {item.time}
              </KvTypography>
            </div>
            <KvTypography variant="body" tone="muted" as="p">
              {item.body}
            </KvTypography>
            <KvTypography variant="caption" tone="brand" as="p" className="mt-kv-pair">
              {item.author}
            </KvTypography>
          </div>
        ))}
      </KvCardContent>
    </KvCard>
  );
}

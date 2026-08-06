'use client';

import {
  KvSelect,
  KvSelectContent,
  KvSelectItem,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/fields/KvSelect';
import { KvTypography } from '@/components/shared/KvTypography';

type DailyApprovalsWorkspaceHeaderProps = {
  title: string;
  termId: string;
  terms: Array<{ id: string; title: string }>;
  onTermChange: (termId: string) => void;
};

export function DailyApprovalsWorkspaceHeader({
  title,
  termId,
  terms,
  onTermChange,
}: DailyApprovalsWorkspaceHeaderProps) {
  return (
    <div className="flex flex-col items-stretch justify-between gap-kv-group sm:flex-row sm:items-center">
      <KvTypography variant="title" weight="bold" as="h2">
        {title}
      </KvTypography>
      <div className="w-full shrink-0 sm:w-52">
        <KvSelect value={termId} onValueChange={onTermChange}>
          <KvSelectTrigger aria-label="نیم‌سال تحصیلی">
            <KvSelectValue placeholder="نیم‌سال تحصیلی" />
          </KvSelectTrigger>
          <KvSelectContent>
            {terms.map((term) => (
              <KvSelectItem key={term.id} value={term.id}>
                {term.title}
              </KvSelectItem>
            ))}
          </KvSelectContent>
        </KvSelect>
      </div>
    </div>
  );
}

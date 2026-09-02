'use client';

import {
  KvSelect,
  KvSelectContent,
  KvSelectItem,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/fields/KvSelect';
import { KvFeatureIntro } from '@/components/shared/shell/KvFeatureIntro';

import { CAPACITY_FEATURE } from '../constants';

type OrganizationalCapacitiesWorkspaceHeaderProps = {
  termId: string;
  terms: Array<{ id: string; title: string }>;
  termsPending?: boolean;
  onTermChange: (termId: string) => void;
};

export function OrganizationalCapacitiesWorkspaceHeader({
  termId,
  terms,
  termsPending = false,
  onTermChange,
}: OrganizationalCapacitiesWorkspaceHeaderProps) {
  const selectedTermId = terms.some((term) => term.id === termId)
    ? termId
    : terms[0]?.id;

  return (
    <div
      data-slot="organizational-capacities-workspace-header"
      className="border-b border-kv-border pb-kv-group"
    >
      <KvFeatureIntro
        title={CAPACITY_FEATURE.title}
        description={CAPACITY_FEATURE.description}
        actions={
          <div className="w-full shrink-0 lg:w-52">
            {selectedTermId ? (
              <KvSelect value={selectedTermId} onValueChange={onTermChange}>
                <KvSelectTrigger
                  aria-label="نیم‌سال تحصیلی"
                  className="bg-kv-surface !shadow-kv-raised"
                >
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
            ) : (
              <div className="flex h-11 items-center rounded-kv-control border border-kv-border bg-kv-surface-muted px-kv-group text-xs font-bold text-kv-text-faint">
                {termsPending
                  ? 'در حال بارگذاری نیم‌سال...'
                  : 'نیم‌سالی یافت نشد'}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}

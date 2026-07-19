'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvSearchField } from '@/components/shared/fields/KvSearchField';
import { faIcons } from '@/utils/iconMap';

import type { OrgStructureTabConfig } from '../constants';

interface OrgStructureToolbarProps {
  tabConfig: OrgStructureTabConfig;
  query: string;
  onQueryChange: (value: string) => void;
  onAdd: () => void;
}

export function OrgStructureToolbar({
  tabConfig,
  query,
  onQueryChange,
  onAdd,
}: OrgStructureToolbarProps) {

  return (
    <div className="flex flex-col justify-start gap-kv-group border-t border-kv-border px-0 pt-kv-section sm:px-kv-group lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-col items-start justify-start gap-kv-field text-start">
        <KvTypography variant="subtitle" weight="bold" as="h3">
          مدیریت ساختار {tabConfig.label}
        </KvTypography>
        <KvTypography variant="caption" tone="muted">
          امکان تعریف، ویرایش و پایش تقسیمات آموزشی و پردیس‌های تابعه دانشگاه
        </KvTypography>
      </div>

      <div className="flex w-full flex-col items-stretch gap-kv-inline sm:flex-row sm:items-center lg:w-auto lg:justify-end">
        <div className="w-full sm:w-64">
          <KvSearchField
            id="org-structure-search"
            value={query}
            placeholder={tabConfig.searchPlaceholder}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>

        <KvButton
          type="button"
          color="cta"
          appearance="solid"
          className="w-full shrink-0 sm:w-auto"
          onClick={onAdd}
          icon={<FaIcon icon={faIcons.plus} size="xs" />}
        >
          افزودن {tabConfig.addLabel}
        </KvButton>
      </div>
    </div>
  );
}

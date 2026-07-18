'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTextField } from '@/components/shared/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
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
    <div className="flex flex-col justify-between gap-4 border-b border-kv-border pb-4 lg:flex-row lg:items-center">
      <div className="text-right">
        <h3 className="font-sans text-xs font-extrabold text-kv-text sm:text-sm">
          مدیریت ساختار {tabConfig.label}
        </h3>
        <p className="mt-1 text-[10px] font-bold text-kv-text-faint">
          امکان تعریف، ویرایش و پایش تقسیمات آموزشی و پردیس‌های تابعه دانشگاه
        </p>
      </div>

      <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:w-auto">
        <div className="w-full sm:w-64">
          <KvTextField
            id="org-structure-search"
            label={false}
            size="sm"
            value={query}
            placeholder={tabConfig.searchPlaceholder}
            onChange={(event) => onQueryChange(event.target.value)}
            startIcon={<FaIcon icon={faIcons.magnifyingGlass} size="xs" />}
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

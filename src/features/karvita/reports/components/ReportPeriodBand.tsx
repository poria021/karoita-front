'use client';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import {
  KvSelect,
  KvSelectContent,
  KvSelectItem,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/fields/KvSelect';
import { KvTypography } from '@/components/shared/KvTypography';
import { MODULES, TERMS } from '@/features/karvita/reports/constants';
import type { AdminReportPageModel } from '@/features/karvita/reports/hooks/useAdminReportPage';
import { toPersianDigits } from '@/utils/persianDigits';

type ReportPeriodBandProps = {
  page: AdminReportPageModel;
};

export function ReportPeriodBand({ page }: ReportPeriodBandProps) {
  const isTerm = page.period.mode === 'term';
  const list = isTerm ? TERMS : MODULES;
  const cur = isTerm ? page.period.termId : page.period.moduleId;
  const showModes = page.def.periodModes !== false;

  return (
    <div className="flex flex-col items-start gap-kv-inline">
      {showModes ? (
        <AppTabs
          value={page.period.mode}
          onValueChange={(value) => {
            if (value === 'term' || value === 'module') page.setMode(value);
          }}
        >
          <AppTabsList aria-label="نظام دوره">
            <AppTabsTrigger value="term">نظام ترمی</AppTabsTrigger>
            <AppTabsTrigger value="module">نظام پودمانی</AppTabsTrigger>
          </AppTabsList>
        </AppTabs>
      ) : null}

      <div className="flex w-full flex-col gap-kv-inline border-y border-kv-border-strong py-kv-inline sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-kv-micro">
          <KvTypography as="h2" variant="subtitle">
            توضیحات
          </KvTypography>
          <KvTypography as="p" variant="caption" className="max-w-[60ch]">
            {page.def.desc[page.period.mode]}
          </KvTypography>
        </div>
        <div className="w-full shrink-0 sm:w-auto sm:min-w-[16rem] sm:max-w-sm">
          <KvSelect
            value={cur}
            onValueChange={(next) => {
              if (next) page.setPeriodId(next);
            }}
          >
            <KvSelectTrigger
              aria-label={isTerm ? 'نیم‌سال تحصیلی' : 'پودمان'}
              className="bg-kv-surface shadow-kv-soft"
            >
              <KvSelectValue
                placeholder={isTerm ? 'نیم‌سال تحصیلی' : 'پودمان'}
              />
            </KvSelectTrigger>
            <KvSelectContent>
              {list.map((option) => (
                <KvSelectItem key={option.id} value={option.id}>
                  {toPersianDigits(option.label)}
                </KvSelectItem>
              ))}
            </KvSelectContent>
          </KvSelect>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

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
import {
  REPORT_PAGE_DEFS,
  enabledReportThemes,
  isReportSlug,
  themeIdForSlug,
} from '@/features/karvita/reports/constants';
import { reportPath } from '@/features/karvita/reports/lib/report-path';
import type { ReportSlug } from '@/types/report-access';

type ReportCategoryNavProps = {
  slug: ReportSlug;
};

/** ناو موبایل گزارش‌ها — تب دسته (بدون باکس)، زیرش سلکت گزارش همان دسته. */
export function ReportCategoryNav({ slug }: ReportCategoryNavProps) {
  const router = useRouter();
  const themes = useMemo(() => enabledReportThemes(), []);
  const themeId = themeIdForSlug(slug) ?? themes[0]?.id ?? '';
  const activeTheme = themes.find((theme) => theme.id === themeId) ?? themes[0];

  if (themes.length === 0 || !activeTheme) return null;

  return (
    <nav
      aria-label="گزارش‌گیری"
      className="flex min-w-0 flex-col gap-kv-inline"
    >
      <AppTabs
        value={themeId}
        onValueChange={(nextId) => {
          const theme = themes.find((item) => item.id === nextId);
          const nextSlug = theme?.slugs[0];
          if (nextSlug) router.push(reportPath(nextSlug));
        }}
        fullWidth
        className="gap-0"
      >
        <AppTabsList aria-label="دسته‌بندی گزارش‌ها">
          {themes.map((theme) => (
            <AppTabsTrigger
              key={theme.id}
              value={theme.id}
              className="px-1.5 text-[0.65rem] leading-tight"
            >
              {theme.title}
            </AppTabsTrigger>
          ))}
        </AppTabsList>
      </AppTabs>

      <KvSelect
        value={slug}
        onValueChange={(next) => {
          if (next && isReportSlug(next)) router.push(reportPath(next));
        }}
      >
        <KvSelectTrigger aria-label={activeTheme.title}>
          <KvSelectValue placeholder="انتخاب گزارش" />
        </KvSelectTrigger>
        <KvSelectContent>
          {activeTheme.slugs.map((reportSlug) => (
            <KvSelectItem key={reportSlug} value={reportSlug}>
              {REPORT_PAGE_DEFS[reportSlug].title}
            </KvSelectItem>
          ))}
        </KvSelectContent>
      </KvSelect>
    </nav>
  );
}

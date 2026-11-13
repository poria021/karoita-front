'use client';

import { KvTypography } from '@/components/shared/KvTypography';
import { AccessTriStateSwitch } from '@/features/karvita/report-access/components/AccessTriStateSwitch';
import { ReportAccessDirtyDot } from '@/features/karvita/report-access/components/ReportAccessDirtyDot';
import {
  COMPARE_MAX,
  COMPARE_REPORT_SLUGS,
  REPORT_ACCESS_THEMES,
  REPORT_PAGE_META,
  ROLE_REPORT_CATALOG,
} from '@/features/karvita/report-access/constants';
import {
  isDirtyForCompare,
  isDirtyForSlug,
  viewAccess,
  viewCompare,
} from '@/features/karvita/report-access/lib/access-matrix';
import { cn } from '@/lib/utils';
import type {
  ReportAccessMatrix,
  ReportAccessRoleId,
  ReportSlug,
} from '@/types/report-access';
import { toPersianDigits } from '@/utils/persianDigits';

type ReportAccessReportRowsProps = {
  roleId: ReportAccessRoleId;
  saved: ReportAccessMatrix;
  draft: ReportAccessMatrix;
  provinceIds: readonly string[];
  onToggleReport: (slug: ReportSlug) => void;
  onToggleCompare: (slug: ReportSlug) => void;
};

function stateLabel(state: string): string {
  if (state === 'on') return 'فعال';
  if (state === 'off') return 'غیرفعال';
  if (state === 'locked') return 'غیرفعال (گزارش خاموش است)';
  return 'فعال در بخشی از استان‌ها';
}

export function ReportAccessReportRows({
  roleId,
  saved,
  draft,
  provinceIds,
  onToggleReport,
  onToggleCompare,
}: ReportAccessReportRowsProps) {
  const catalog = ROLE_REPORT_CATALOG[roleId];

  return (
    <div role="tabpanel" id="ac-panel" aria-labelledby={`ac-tab-${roleId}`}>
      {REPORT_ACCESS_THEMES.map((theme) => {
        const slugs = theme.slugs.filter((slug) => catalog.includes(slug));
        if (!slugs.length) return null;

        return (
          <div key={theme.id}>
            <KvTypography
              as="h3"
              variant="overline"
              tone="muted"
              className="border-y border-kv-border-muted bg-kv-surface-muted px-kv-group py-kv-pair"
            >
              {theme.title}
            </KvTypography>
            {slugs.map((slug) => {
              const meta = REPORT_PAGE_META[slug];
              const view = viewAccess(draft, roleId, slug, provinceIds);
              const dirty = isDirtyForSlug(saved, draft, roleId, slug);
              const showCompare = COMPARE_REPORT_SLUGS.includes(slug);
              const cmpState = showCompare
                ? viewCompare(draft, roleId, slug)
                : null;
              const cmpDirty = showCompare
                ? isDirtyForCompare(saved, draft, roleId, slug)
                : false;

              return (
                <div key={slug}>
                  <div
                    className={cn(
                      'flex items-center gap-kv-group border-b border-kv-border-muted px-kv-group py-kv-group transition-colors hover:bg-kv-surface-muted'
                    )}
                    data-s={view}
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-kv-micro">
                      <KvTypography
                        as="span"
                        variant="label"
                        weight={view === 'off' ? 'medium' : 'bold'}
                        tone={view === 'off' ? 'muted' : 'default'}
                        className="flex items-center gap-kv-pair"
                      >
                        {meta.title}
                        {dirty ? <ReportAccessDirtyDot /> : null}
                      </KvTypography>
                      <KvTypography as="span" variant="caption" tone="muted">
                        {meta.description}
                      </KvTypography>
                    </div>
                    <AccessTriStateSwitch
                      state={view}
                      label={`${meta.title} — ${stateLabel(view)}`}
                      onToggle={() => onToggleReport(slug)}
                    />
                  </div>

                  {showCompare && cmpState ? (
                    <div
                      className={cn(
                        'relative flex items-center gap-kv-group border-b border-kv-border-muted bg-kv-surface-muted py-kv-group pe-kv-group ps-10 transition-colors hover:bg-kv-surface-subtle max-sm:ps-8',
                        'before:absolute before:bottom-1/2 before:start-5 before:top-0 before:w-2.5 before:rounded-ee-sm before:border-b before:border-s before:border-kv-border-strong before:content-[""] max-sm:before:start-4'
                      )}
                      data-s={cmpState === 'locked' ? 'off' : cmpState}
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-kv-micro">
                        <KvTypography
                          as="span"
                          variant="label"
                          weight="bold"
                          className="flex items-center gap-kv-pair"
                        >
                          امکان مقایسه
                          {cmpDirty ? <ReportAccessDirtyDot /> : null}
                        </KvTypography>
                        <KvTypography as="span" variant="caption" tone="muted">
                          {cmpState === 'locked'
                            ? `ابتدا دسترسی به «${meta.title}» را روشن کنید.`
                            : `انتخاب تا ${toPersianDigits(COMPARE_MAX)} مورد و مقایسه‌ی معیارها کنار هم؛ فقط در محدوده‌ی همین گزارش.`}
                        </KvTypography>
                      </div>
                      <AccessTriStateSwitch
                        state={cmpState}
                        disabled={cmpState === 'locked'}
                        label={`امکان مقایسه در ${meta.title} — ${stateLabel(cmpState)}`}
                        onToggle={() => onToggleCompare(slug)}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

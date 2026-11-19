'use client';

import { KvTypography } from '@/components/shared/KvTypography';
import { AccessTriStateSwitch } from '@/features/karvita/report-access/components/AccessTriStateSwitch';
import {
  REPORT_ACCESS_THEMES,
  REPORT_PAGE_META,
} from '@/features/karvita/report-access/constants';
import { isEnabledReportSlug } from '@/features/karvita/reports/constants';
import type {
  ReportAccessRoleId,
  ReportAccessRow,
  ReportSlug,
} from '@/types/report-access';

type ReportAccessReportRowsProps = {
  roleId: ReportAccessRoleId;
  /** ردیف‌های همین نقش از API؛ گزارشی که نیست برای این نقش ممنوع است. */
  rowBySlug: ReadonlyMap<ReportSlug, ReportAccessRow>;
  /** فقط مدیر ارشد می‌تواند سوییچ optional را عوض کند. */
  canEdit: boolean;
  isPending: (slug: ReportSlug) => boolean;
  onToggleReport: (slug: ReportSlug) => void;
};

function StatusText({ children }: { children: string }) {
  return (
    <KvTypography as="span" variant="caption" tone="muted" className="shrink-0">
      {children}
    </KvTypography>
  );
}

export function ReportAccessReportRows({
  roleId,
  rowBySlug,
  canEdit,
  isPending,
  onToggleReport,
}: ReportAccessReportRowsProps) {
  return (
    <div role="tabpanel" id="ac-panel" aria-labelledby={`ac-tab-${roleId}`}>
      {REPORT_ACCESS_THEMES.map((theme) => {
        const slugs = theme.slugs.filter((slug) =>
          isEnabledReportSlug(slug, roleId)
        );
        if (!slugs.length) return null;

        return (
          <div key={theme.id}>
            <KvTypography
              as="h3"
              variant="subtitle"
              weight="black"
              className="border-y border-kv-border-muted bg-kv-surface-subtle px-kv-group py-kv-inline"
            >
              {theme.title}
            </KvTypography>
            {slugs.map((slug) => {
              const meta = REPORT_PAGE_META[slug];
              const row = rowBySlug.get(slug);
              const forbidden = !row;

              return (
                <div
                  key={slug}
                  className="flex items-center gap-kv-group border-b border-kv-border-muted px-kv-group py-kv-group transition-colors hover:bg-kv-surface-muted"
                  data-s={forbidden ? 'forbidden' : row.status}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-kv-micro">
                    <KvTypography
                      as="span"
                      variant="label"
                      weight={forbidden || !row.enabled ? 'medium' : 'bold'}
                      tone={forbidden || !row.enabled ? 'muted' : 'default'}
                    >
                      {meta.title}
                    </KvTypography>
                    <KvTypography as="span" variant="caption" tone="muted">
                      {meta.description}
                    </KvTypography>
                  </div>

                  {forbidden ? (
                    // report برای این نقش در آرایه نیست → ممنوع (خط تیره)؛ سوییچ نساز.
                    <span
                      className="shrink-0 text-kv-muted"
                      aria-label={`${meta.title} — برای این نقش قابل اعطا نیست`}
                    >
                      —
                    </span>
                  ) : row.access === 'default' ? (
                    // default همیشه فعال است؛ سوییچ ندارد.
                    <StatusText>پیش‌فرض (همیشه فعال)</StatusText>
                  ) : canEdit ? (
                    <AccessTriStateSwitch
                      state={row.enabled ? 'on' : 'off'}
                      disabled={isPending(slug)}
                      label={`${meta.title} — ${row.enabled ? 'فعال' : 'غیرفعال'}`}
                      onToggle={() => onToggleReport(slug)}
                    />
                  ) : (
                    <StatusText>{row.enabled ? 'فعال' : 'غیرفعال'}</StatusText>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

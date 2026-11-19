'use client';

import {
  KvDialog,
  KvDialogContent,
  KvDialogDescription,
  KvDialogHeader,
  KvDialogTitle,
} from '@/components/shared/KvDialog';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import { StatusBadge } from '@/features/karvita/reports/components/ReportCells';
import type { AdminReportPageModel } from '@/features/karvita/reports/hooks/useAdminReportPage';
import { toPersianDigits } from '@/utils/persianDigits';

type ReportLearnerDialogsProps = {
  page: AdminReportPageModel;
};

export function ReportLearnerDialogs({ page }: ReportLearnerDialogsProps) {
  const open = Boolean(page.dialog);

  return (
    <KvDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) page.closeDialog();
      }}
    >
      <KvDialogContent size="lg" className="max-h-[90dvh] overflow-hidden">
        {page.dialog?.type === 'courses' ? (
          <>
            <KvDialogHeader>
              <KvDialogTitle>
                درس‌های {page.courseDetail?.learnerName ?? '…'}
              </KvDialogTitle>
              <KvDialogDescription>
                {page.courseDetail?.periodLabel}
              </KvDialogDescription>
            </KvDialogHeader>
            {page.dialogLoading || !page.courseDetail ? (
              <KvBusySurface label="در حال دریافت درس‌ها" />
            ) : (
              <ul className="divide-y divide-kv-border-muted overflow-y-auto py-kv-inline">
                {page.courseDetail.courses.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-col gap-0.5 px-1 py-kv-inline"
                  >
                    <KvTypography as="span" variant="subtitle">
                      {c.name}
                    </KvTypography>
                    {c.code ? (
                      <KvTypography as="span" variant="caption" tone="muted">
                        کد درس {c.code}
                      </KvTypography>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <KvDialogHeader>
              <KvDialogTitle>
                عملکرد {page.scoreDetail?.learnerName ?? '…'}
              </KvDialogTitle>
              <KvDialogDescription>
                {page.scoreDetail?.periodLabel}
              </KvDialogDescription>
            </KvDialogHeader>
            {page.dialogLoading || !page.scoreDetail ? (
              <KvBusySurface label="در حال دریافت اطلاعات" />
            ) : (
              <ul className="max-h-[60dvh] divide-y divide-kv-border-muted overflow-y-auto py-kv-inline">
                {page.scoreDetail.courses.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-kv-inline px-1 py-kv-inline"
                  >
                    <KvTypography as="span" variant="subtitle">
                      {c.name}
                    </KvTypography>
                    <span className="flex shrink-0 items-center gap-kv-inline">
                      <KvTypography as="span" variant="caption" tone="muted">
                        نمره پایانی{' '}
                        <b>
                          {c.average === null ? '—' : toPersianDigits(c.average)}
                        </b>
                      </KvTypography>
                      {c.status ? <StatusBadge status={c.status} /> : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </KvDialogContent>
    </KvDialog>
  );
}

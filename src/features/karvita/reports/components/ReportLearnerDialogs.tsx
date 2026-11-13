'use client';

import {
  KvAccordion,
  KvAccordionContent,
  KvAccordionItem,
  KvAccordionTrigger,
  KvAccordionTriggerMeta,
} from '@/components/shared/KvAccordion';
import {
  KvDialog,
  KvDialogContent,
  KvDialogDescription,
  KvDialogHeader,
  KvDialogTitle,
} from '@/components/shared/KvDialog';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import { Badge } from '@/components/ui/badge';
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
                    <KvTypography as="span" variant="caption" tone="muted">
                      کد درس {c.code}
                    </KvTypography>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <KvDialogHeader>
              <KvDialogTitle>
                ریز نمرات {page.scoreDetail?.learnerName ?? '…'}
              </KvDialogTitle>
              <KvDialogDescription>
                {page.scoreDetail?.periodLabel}
              </KvDialogDescription>
            </KvDialogHeader>
            {page.dialogLoading || !page.scoreDetail ? (
              <KvBusySurface label="در حال دریافت ریز نمرات" />
            ) : (
              <div className="max-h-[60dvh] overflow-y-auto py-kv-inline">
                <KvAccordion
                  type="single"
                  collapsible
                  defaultValue={page.scoreDetail.courses[0]?.id}
                >
                  {page.scoreDetail.courses.map((c) => (
                    <KvAccordionItem key={c.id} value={c.id}>
                      <KvAccordionTrigger>
                        <KvAccordionTriggerMeta
                          title={c.name}
                          trailing={
                            <KvTypography as="span" variant="caption" tone="muted">
                              میانگین{' '}
                              <b>
                                {c.average === null
                                  ? '—'
                                  : toPersianDigits(c.average)}
                              </b>{' '}
                              از ۱۰۰
                            </KvTypography>
                          }
                        />
                      </KvAccordionTrigger>
                      <KvAccordionContent>
                        <div className="flex flex-wrap gap-2">
                          {c.sessions.map((score, si) => (
                            <Badge
                              key={si}
                              variant="default"
                              className="min-w-12 flex-col gap-0.5 px-2 py-1"
                            >
                              <span className="text-[0.6875rem] font-medium text-kv-text-faint">
                                جلسه {toPersianDigits(si + 1)}
                              </span>
                              <span className="text-sm font-black tabular-nums text-kv-text">
                                {score === null ? '—' : toPersianDigits(score)}
                              </span>
                            </Badge>
                          ))}
                        </div>
                      </KvAccordionContent>
                    </KvAccordionItem>
                  ))}
                </KvAccordion>
              </div>
            )}
          </>
        )}
      </KvDialogContent>
    </KvDialog>
  );
}

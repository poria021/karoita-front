'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvConfirmationDialog } from '@/components/shared/KvConfirmationDialog';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import { faIcons } from '@/utils/iconMap';

import { useOrganizationalCapacitiesPage } from '../hooks/useOrganizationalCapacitiesPage';
import { OrganizationalCapacitiesGuard } from './OrganizationalCapacitiesGuard';
import { OrganizationalCapacitiesHeader } from './OrganizationalCapacitiesHeader';
import { OrganizationalCapacitiesMobileList } from './OrganizationalCapacitiesMobileList';
import { OrganizationalCapacitiesSummary } from './OrganizationalCapacitiesSummary';
import { OrganizationalCapacitiesTable } from './OrganizationalCapacitiesTable';

export function OrganizationalCapacitiesPageClient() {
  const page = useOrganizationalCapacitiesPage();
  const resetKey = `${page.kind}::${page.termId}::${page.snapshot?.status ?? 'loading'}`;

  return (
    <OrganizationalCapacitiesGuard>
      <div className="space-y-kv-group">
        <OrganizationalCapacitiesHeader
          kind={page.kind}
          onKindChange={page.changeKind}
        />

        {page.error ? (
          <KvAlert
            variant="error"
            title="بارگذاری ظرفیت‌ها ناموفق بود"
            description={page.error}
            actions={
              <KvButton
                type="button"
                appearance="secondary"
                size="sm"
                onClick={page.reload}
              >
                تلاش مجدد
              </KvButton>
            }
          />
        ) : null}

        {page.isLoading || !page.snapshot ? (
          <KvBusySurface className="min-h-[280px] rounded-kv-control" />
        ) : (
          <>
            {page.locked ? (
              <KvAlert
                variant="info"
                title="ظرفیت این نیم‌سال ارسال شده است"
                description="پس از ثبت نهایی، ویرایش ظرفیت و روزهای حضور تا تعیین تکلیف مدیریت قفل می‌ماند."
              />
            ) : null}

            <OrganizationalCapacitiesSummary summary={page.snapshot.summary} />

            <div className="hidden lg:block">
              <OrganizationalCapacitiesTable
                courses={page.snapshot.courses}
                maxCapacity={page.snapshot.maxCapacity}
                locked={page.locked}
                resetKey={resetKey}
                onTotalChange={(courseId, value) =>
                  void page.updateCourseTotal(courseId, value)
                }
                onToggleDay={(courseId, day) =>
                  void page.toggleDay(courseId, day)
                }
              />
            </div>

            <OrganizationalCapacitiesMobileList
              courses={page.snapshot.courses}
              maxCapacity={page.snapshot.maxCapacity}
              locked={page.locked}
              expandedCourseId={page.expandedCourseId}
              onExpandedChange={page.setExpandedCourseId}
              onTotalChange={(courseId, value) =>
                void page.updateCourseTotal(courseId, value)
              }
              onToggleDay={(courseId, day) =>
                void page.toggleDay(courseId, day)
              }
            />

            <div className="flex justify-end border-t border-kv-border pt-kv-group">
              <KvButton
                type="button"
                color="cta"
                appearance="solid"
                size="md"
                disabled={page.locked || page.actionBusy || !page.isDirty}
                loading={page.actionBusy}
                icon={<FaIcon icon={faIcons.cloudArrowUp} size="xs" />}
                onClick={() => page.setConfirmOpen(true)}
              >
                ثبت نهایی و ارسال به مدیریت
              </KvButton>
            </div>
          </>
        )}
      </div>

      <KvConfirmationDialog
        isOpen={page.confirmOpen}
        onClose={() => page.setConfirmOpen(false)}
        onConfirm={() => void page.submit()}
        title="تایید و ارسال نهایی ظرفیت‌ها"
        description="آیا مایل به ثبت نهایی ظرفیت‌های پذیرش اعلام‌شده هستید؟ پس از ارسال، پنل سهمیه شما قفل خواهد شد."
        confirmText="ارسال نهایی"
        cancelText="انصراف"
        confirmDisabled={page.actionBusy || !page.isDirty}
      />
    </OrganizationalCapacitiesGuard>
  );
}

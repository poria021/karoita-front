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
      <div className="flex flex-col gap-kv-group">
        <OrganizationalCapacitiesHeader
          kind={page.kind}
          onKindChange={page.changeKind}
        />

        <div className="space-y-kv-group border-t border-kv-border py-kv-group">
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
              <OrganizationalCapacitiesSummary summary={page.snapshot.summary} />

              <div className="hidden lg:block">
                <OrganizationalCapacitiesTable
                  courses={page.snapshot.courses}
                  maxCapacity={page.snapshot.maxCapacity}
                  locked={false}
                  resetKey={resetKey}
                  onTotalChange={(courseId, value) =>
                    page.updateCourseTotal(courseId, value)
                  }
                  onToggleDay={(courseId, day) =>
                    page.toggleDay(courseId, day)
                  }
                />
              </div>

              <OrganizationalCapacitiesMobileList
                courses={page.snapshot.courses}
                maxCapacity={page.snapshot.maxCapacity}
                locked={false}
                expandedCourseId={page.expandedCourseId}
                onExpandedChange={page.setExpandedCourseId}
                onTotalChange={(courseId, value) =>
                  page.updateCourseTotal(courseId, value)
                }
                onToggleDay={(courseId, day) =>
                  page.toggleDay(courseId, day)
                }
              />

              <div className="flex justify-end border-t border-kv-border pt-kv-group">
                <KvButton
                  type="button"
                  color="cta"
                  appearance="solid"
                  size="md"
                  disabled={page.actionBusy || !page.isDirty}
                  loading={page.actionBusy}
                  icon={<FaIcon icon={faIcons.cloudArrowUp} size="xs" />}
                  onClick={() => page.setConfirmOpen(true)}
                >
                  ثبت و ذخیره تغییرات ظرفیت‌ها
                </KvButton>
              </div>
            </>
          )}
        </div>
      </div>

      <KvConfirmationDialog
        isOpen={page.confirmOpen}
        onClose={() => page.setConfirmOpen(false)}
        onConfirm={() => void page.submit()}
        title="تایید و ذخیره ظرفیت‌ها"
        description="آیا مایل به ذخیره تغییرات ظرفیت‌های پذیرش اعلام‌شده هستید؟"
        confirmText="ذخیره تغییرات"
        cancelText="انصراف"
        confirmDisabled={page.actionBusy || !page.isDirty}
      />
    </OrganizationalCapacitiesGuard>
  );
}

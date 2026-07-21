'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvConfirmationDialog } from '@/components/shared/KvConfirmationDialog';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';
import { getPostLoginPath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';
import type { SyllabusConfigSubTab } from '@/types/syllabus-config';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { useSyllabusConfigPage } from '../hooks/useSyllabusConfigPage';
import { CourseOfferingsPageSkeleton } from '../skeletons/CourseOfferingsPageSkeleton';
import { TermSettingsPageSkeleton } from '../skeletons/TermSettingsPageSkeleton';
import { CourseOfferingsPanel } from './CourseOfferingsPanel';
import { TermSettingsPanel } from './TermSettingsPanel';
import { WeekEditDialog } from './WeekEditDialog';

type SyllabusModulePageProps = {
  section: SyllabusConfigSubTab;
};

function SyllabusModulePage({ section }: SyllabusModulePageProps) {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);
  const page = useSyllabusConfigPage(section);

  useEffect(() => {
    if (!activeUser) return;
    if (!isSuperAdminRole(activeUser.role)) {
      router.replace(getPostLoginPath(activeUser));
    }
  }, [activeUser, router]);

  if (!activeUser || !isSuperAdminRole(activeUser.role)) {
    return <div className="min-h-40 w-full bg-kv-canvas" aria-busy="true" />;
  }

  if (page.isCold && !page.error) {
    return section === 'course_offerings' ? (
      <CourseOfferingsPageSkeleton />
    ) : (
      <TermSettingsPageSkeleton />
    );
  }

  const errorTitle =
    section === 'course_offerings'
      ? 'بارگذاری ارائه و سرفصل دروس ناموفق بود'
      : 'بارگذاری تنظیمات عمومی ترم‌ها ناموفق بود';

  return (
    <>
      <KvWorkspace panel={false}>
        <div className="space-y-kv-section">
          {page.error ? (
            <KvAlert
              variant="error"
              title={errorTitle}
              description={page.error}
              actions={
                <KvButton
                  type="button"
                  appearance="secondary"
                  size="sm"
                  onClick={() => void page.reload()}
                >
                  تلاش مجدد
                </KvButton>
              }
            />
          ) : section === 'course_offerings' ? (
            <CourseOfferingsPanel
              terms={page.terms}
              selectedTerm={page.selectedTerm}
              selectTerm={page.selectTerm}
              toggleEnroll={page.toggleEnroll}
              toggleTermOpen={page.toggleTermOpen}
              courses={page.courses}
              selectedCourse={page.selectedCourse}
              selectCourse={page.selectCourse}
              offeredCatalogIds={page.offeredCatalogIds}
              toggleCourseOffering={page.toggleCourseOffering}
              weeks={page.weeks}
              isLoading={page.isLoading}
              isSelectedCourseOffered={page.isSelectedCourseOffered}
              hasUnsavedChanges={page.hasUnsavedChanges}
              isSaving={page.isSaving}
              updateWeekWeight={page.updateWeekWeight}
              openWeekEdit={page.openWeekEdit}
              restoreWeek={page.restoreWeek}
              archiveWeek={page.archiveWeek}
              addWeek={page.addWeek}
              requestDeleteWeek={page.requestDeleteWeek}
              saveSyllabus={page.saveSyllabus}
            />
          ) : (
            <TermSettingsPanel
              terms={page.terms}
              editTermId={page.editTermId}
              selectEditTerm={page.selectEditTerm}
              termType={page.termType}
              onTermTypeChange={page.onTermTypeChange}
              termPrefix={page.termPrefix}
              setTermPrefix={page.setTermPrefix}
              termYear={page.termYear}
              setTermYear={page.setTermYear}
              academicYears={page.academicYears}
              isSaving={page.isSaving}
              termFormError={page.termFormError}
              saveTerm={page.saveTerm}
              requestDeleteTerm={page.requestDeleteTerm}
              professorCapacity={page.professorCapacity}
              setProfessorCapacity={page.setProfessorCapacity}
              saveProfessorCapacity={page.saveProfessorCapacity}
              passingThreshold={page.passingThreshold}
              setPassingThreshold={page.setPassingThreshold}
              savePassingThreshold={page.savePassingThreshold}
            />
          )}
        </div>
      </KvWorkspace>

      {section === 'course_offerings' ? (
        <>
          <WeekEditDialog
            open={Boolean(page.weekEditId)}
            title={page.weekEditTitle}
            error={page.weekEditError}
            onTitleChange={page.setWeekEditTitle}
            onClose={page.closeWeekEdit}
            onSave={page.saveWeekEdit}
          />

          <KvConfirmationDialog
            isOpen={Boolean(page.pendingNavigation)}
            onClose={page.clearPendingNavigation}
            onConfirm={page.confirmDiscardAndNavigate}
            title="تغییرات ذخیره‌نشده"
            description="تغییرات سرفصل هفتگی هنوز ثبت نهایی نشده‌اند. با ادامه، این تغییرات از بین می‌روند. آیا ادامه می‌دهید؟"
            confirmText="دور انداختن و ادامه"
            cancelText="ماندن"
            confirmVariant="destructive"
          />

          <KvConfirmationDialog
            isOpen={Boolean(page.gateCloseTarget)}
            onClose={page.clearGateClose}
            onConfirm={page.confirmGateClose}
            title={
              page.gateCloseTarget === 'enroll'
                ? 'بستن انتخاب واحد'
                : 'غیرفعال‌سازی برگزاری کلاس‌ها'
            }
            description={
              page.gateCloseTarget === 'enroll'
                ? 'با بستن انتخاب واحد، دسترسی دانشجویان به ثبت‌نام در پورتال قطع می‌شود. آیا ادامه می‌دهید؟'
                : 'با غیرفعال‌سازی برگزاری کلاس‌ها، ترم برای کاربران بسته می‌شود. آیا ادامه می‌دهید؟'
            }
            confirmText="بستن"
            cancelText="انصراف"
            confirmVariant="destructive"
          />

          <KvConfirmationDialog
            isOpen={Boolean(page.deactivateCourseTarget)}
            onClose={page.clearDeactivateCourse}
            onConfirm={page.confirmDeactivateCourse}
            title="غیرفعال‌سازی ارائه درس"
            description={
              page.deactivateCourseTarget
                ? `با غیرفعال کردن «${page.deactivateCourseTarget.title}»، ارائه این درس در نیم‌سال جاری متوقف می‌شود. آیا ادامه می‌دهید؟`
                : ''
            }
            confirmText="غیرفعال کردن"
            cancelText="انصراف"
            confirmVariant="destructive"
          />

          <KvConfirmationDialog
            isOpen={page.deleteWeekConfirmOpen}
            onClose={page.clearDeleteWeek}
            onConfirm={page.confirmDeleteWeek}
            title="حذف هفته"
            description={
              page.deleteWeekTarget
                ? `آیا از حذف هفته «${page.deleteWeekTarget.title || page.deleteWeekTarget.suffix}» اطمینان دارید؟`
                : ''
            }
            confirmText="حذف هفته"
            cancelText="انصراف"
            confirmVariant="destructive"
          />
        </>
      ) : (
        <KvConfirmationDialog
          isOpen={Boolean(page.deleteTermTarget)}
          onClose={page.clearDeleteTerm}
          onConfirm={page.confirmDeleteTerm}
          title="حذف دوره تحصیلی"
          description={
            page.deleteTermTarget
              ? `آیا مایل به حذف کامل «${toPersianDigits(page.deleteTermTarget.title)}» و سرفصل‌های آن هستید؟ این عملیات غیرقابل بازگشت است.`
              : ''
          }
          confirmText="حذف"
          cancelText="انصراف"
          confirmVariant="destructive"
        />
      )}
    </>
  );
}

export function CourseOfferingsPage() {
  return <SyllabusModulePage section="course_offerings" />;
}

export function TermSettingsPage() {
  return <SyllabusModulePage section="term_settings" />;
}

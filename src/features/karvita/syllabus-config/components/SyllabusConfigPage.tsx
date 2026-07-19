'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvConfirmationDialog } from '@/components/shared/KvConfirmationDialog';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';
import { getPostLoginPath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { useSyllabusConfigPage } from '../hooks/useSyllabusConfigPage';
import { CourseOfferingsPanel } from './CourseOfferingsPanel';
import { SyllabusConfigSubTabs } from './SyllabusConfigSubTabs';
import { TermSettingsPanel } from './TermSettingsPanel';
import { WeekEditDialog } from './WeekEditDialog';

export function SyllabusConfigPage() {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);
  const page = useSyllabusConfigPage();

  useEffect(() => {
    if (!activeUser) return;
    if (!isSuperAdminRole(activeUser.role)) {
      router.replace(getPostLoginPath(activeUser));
    }
  }, [activeUser, router]);

  if (!activeUser || !isSuperAdminRole(activeUser.role)) {
    return <div className="min-h-40 w-full bg-kv-canvas" aria-busy="true" />;
  }

  return (
    <>
      <KvWorkspace
        panel={false}
        tabs={
          <SyllabusConfigSubTabs
            active={page.tab}
            onChange={page.changeTab}
          />
        }
      >
        {page.error ? (
          <div className="p-kv-group">
            <KvAlert
              variant="error"
              title="بارگذاری مدیریت ترم و سرفصل ناموفق بود"
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
          </div>
        ) : page.tab === 'course_offerings' ? (
          <div className="p-kv-group">
            <CourseOfferingsPanel
              terms={page.terms}
              selectedTerm={page.selectedTerm}
              selectTerm={page.selectTerm}
              toggleEnroll={page.toggleEnroll}
              toggleTermOpen={page.toggleTermOpen}
              courses={page.courses}
              selectedCourse={page.selectedCourse}
              selectCourse={page.selectCourse}
              offeredTitles={page.offeredTitles}
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
          </div>
        ) : (
          <div className="p-kv-group">
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
              saveTerm={page.saveTerm}
              requestDeleteTerm={page.requestDeleteTerm}
              professorCapacity={page.professorCapacity}
              setProfessorCapacity={page.setProfessorCapacity}
              saveProfessorCapacity={page.saveProfessorCapacity}
              passingThreshold={page.passingThreshold}
              setPassingThreshold={page.setPassingThreshold}
              savePassingThreshold={page.savePassingThreshold}
            />
          </div>
        )}
      </KvWorkspace>

      <WeekEditDialog
        open={Boolean(page.weekEditId)}
        title={page.weekEditTitle}
        onTitleChange={page.setWeekEditTitle}
        onClose={page.closeWeekEdit}
        onSave={page.saveWeekEdit}
      />

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
  );
}

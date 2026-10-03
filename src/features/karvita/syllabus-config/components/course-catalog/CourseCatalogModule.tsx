'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvConfirmationDialog } from '@/components/shared/KvConfirmationDialog';
import { SuperAdminModuleGuard } from '@/components/shared/shell/SuperAdminModuleGuard';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';

import { useCourseCatalogPage } from '../../hooks/useCourseCatalogPage';
import { CourseDefinitionFormCard } from './CourseDefinitionFormCard';
import { CourseDefinitionsList } from './CourseDefinitionsList';

/** صفحهٔ تعریف دروس — خروجی‌اش منبع جدول «ارائه و سرفصل دروس» است. */
export function CourseCatalogModule() {
  const page = useCourseCatalogPage();

  return (
    <SuperAdminModuleGuard>
      <KvWorkspace panel={false}>
        {page.error ? (
          <KvAlert
            variant="error"
            title="بارگذاری دروس ناموفق بود"
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
        ) : (
          <div className="flex w-full justify-center">
            <div className="grid w-full grid-cols-1 items-start gap-kv-group lg:max-w-5xl lg:grid-cols-12 xl:max-w-6xl">
              <div className="lg:col-span-5">
                <CourseDefinitionFormCard
                  form={page.form}
                  isEditing={page.isEditing}
                  isDirty={page.isDirty}
                  formError={page.formError}
                  isSaving={page.isSaving}
                  isLoading={page.isLoading}
                  patchForm={page.patchForm}
                  resetForm={page.resetForm}
                  setHasSubModules={page.setHasSubModules}
                  addSubModule={page.addSubModule}
                  updateSubModule={page.updateSubModule}
                  removeSubModule={page.removeSubModule}
                  moveSubModule={page.moveSubModule}
                  saveCourse={page.saveCourse}
                  requestDelete={page.requestDelete}
                  listCourses={page.listCourses}
                />
              </div>
              <div className="lg:col-span-7">
                <CourseDefinitionsList
                  listAudience={page.listAudience}
                  changeListAudience={page.changeListAudience}
                  audienceCounts={page.audienceCounts}
                  listCourses={page.listCourses}
                  isLoading={page.isLoading}
                  form={page.form}
                  startEdit={page.startEdit}
                  requestDelete={page.requestDelete}
                  pendingActiveId={page.pendingActiveId}
                  toggleCourseActive={page.toggleCourseActive}
                />
              </div>
            </div>
          </div>
        )}
      </KvWorkspace>

      <KvConfirmationDialog
        isOpen={Boolean(page.deleteTarget)}
        onClose={page.clearDelete}
        onConfirm={page.confirmDelete}
        title="حذف درس"
        description={
          page.deleteTarget
            ? `درس «${page.deleteTarget.title}»${
                page.deleteTarget.subModules.length > 0
                  ? ' و همهٔ زیرمجموعه‌هایش'
                  : ''
              } حذف می‌شود و سرفصل‌های ذخیره‌شده‌اش هم پاک می‌شود. آیا ادامه می‌دهید؟`
            : ''
        }
        confirmText="حذف"
        cancelText="انصراف"
        confirmVariant="destructive"
      />
    </SuperAdminModuleGuard>
  );
}

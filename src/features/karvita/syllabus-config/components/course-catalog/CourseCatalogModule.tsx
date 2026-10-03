'use client';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvConfirmationDialog } from '@/components/shared/KvConfirmationDialog';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvWorkspace } from '@/components/shared/shell/KvWorkspace';
import { SuperAdminModuleGuard } from '@/components/shared/shell/SuperAdminModuleGuard';
import type { AcademicTermType } from '@/types/syllabus-config';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { COURSE_AUDIENCE_OPTIONS } from '../../constants';
import { useCourseCatalogPage } from '../../hooks/useCourseCatalogPage';
import { CourseDefinitionModal } from './CourseDefinitionModal';
import { CourseDefinitionsTable } from './CourseDefinitionsTable';

/** صفحهٔ تعریف دروس — جدول با فیلتر ترمی/پودمانی؛ افزودن و ویرایش در مودال. */
export function CourseCatalogModule() {
  const page = useCourseCatalogPage();

  return (
    <SuperAdminModuleGuard>
      <KvWorkspace
        panel={false}
        tabs={
          <div className="mb-kv-pair">
            <AppTabs
              value={page.listAudience}
              onValueChange={(value) =>
                page.changeListAudience(value as AcademicTermType)
              }
              gridCols={2}
            >
              <AppTabsList aria-label="فیلتر پنل دروس">
                {COURSE_AUDIENCE_OPTIONS.map((option) => (
                  <AppTabsTrigger key={option.value} value={option.value}>
                    {option.label} (
                    {toPersianDigits(String(page.audienceCounts[option.value]))})
                  </AppTabsTrigger>
                ))}
              </AppTabsList>
            </AppTabs>
          </div>
        }
        toolbar={
          <div className="flex flex-col justify-start gap-kv-group pt-kv-pair lg:flex-row lg:items-center lg:justify-between lg:ps-kv-group">
            <div className="flex min-w-0 flex-col items-start gap-kv-field text-start">
              <KvTypography variant="subtitle" weight="bold" as="h3">
                تعریف دروس
              </KvTypography>
              <KvTypography variant="caption" tone="muted">
                درس‌ها و زیرمجموعه‌هایشان را تعریف کنید؛ هر درس در «ارائه و
                سرفصل دروس»، «ظرفیت‌ها» و «ارزیابی گزارش‌ها» دیده می‌شود.
              </KvTypography>
            </div>
            <KvButton
              type="button"
              color="cta"
              appearance="solid"
              className="w-full shrink-0 lg:w-auto"
              disabled={page.isLoading || Boolean(page.error)}
              onClick={page.openCreate}
              icon={<FaIcon icon={faIcons.plus} size="xs" />}
              iconPosition="start"
            >
              افزودن درس
            </KvButton>
          </div>
        }
      >
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
          <CourseDefinitionsTable
            courses={page.listCourses}
            audience={page.listAudience}
            isLoading={page.isLoading}
            onAdd={page.openCreate}
            onEdit={page.startEdit}
            onDelete={page.requestDelete}
          />
        )}
      </KvWorkspace>

      <CourseDefinitionModal
        modalOpen={page.modalOpen}
        closeModal={page.closeModal}
        form={page.form}
        isEditing={page.isEditing}
        isDirty={page.isDirty}
        formError={page.formError}
        isSaving={page.isSaving}
        patchForm={page.patchForm}
        setHasSubModules={page.setHasSubModules}
        addSubModule={page.addSubModule}
        updateSubModule={page.updateSubModule}
        removeSubModule={page.removeSubModule}
        moveSubModule={page.moveSubModule}
        saveCourse={page.saveCourse}
      />

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

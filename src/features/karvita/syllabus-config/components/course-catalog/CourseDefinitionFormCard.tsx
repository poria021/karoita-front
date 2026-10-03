'use client';

import { AppTabs, AppTabsList, AppTabsTrigger } from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvCardTitleIcon } from '@/components/shared/KvCardTitleIcon';
import { KvFieldFrame } from '@/components/shared/fields/KvFieldFrame';
import { KvSwitch } from '@/components/shared/fields/KvSwitch';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
import type { AcademicTermType } from '@/types/syllabus-config';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { COURSE_AUDIENCE_OPTIONS } from '../../constants';
import type { UseCourseCatalogPageReturn } from '../../hooks/useCourseCatalogPage';

type CourseDefinitionFormCardProps = Pick<
  UseCourseCatalogPageReturn,
  | 'form'
  | 'isEditing'
  | 'isDirty'
  | 'formError'
  | 'isSaving'
  | 'isLoading'
  | 'patchForm'
  | 'resetForm'
  | 'setHasSubModules'
  | 'addSubModule'
  | 'updateSubModule'
  | 'removeSubModule'
  | 'moveSubModule'
  | 'saveCourse'
  | 'requestDelete'
  | 'listCourses'
>;

const AUDIENCE_ICONS: Record<AcademicTermType, typeof faIcons.graduationCap> = {
  semester: faIcons.graduationCap,
  modular: faIcons.screwdriverWrench,
};

export function CourseDefinitionFormCard(props: CourseDefinitionFormCardProps) {
  const { form, isEditing, isSaving, isLoading } = props;
  const busy = isSaving || isLoading;
  const audienceOption =
    COURSE_AUDIENCE_OPTIONS.find((option) => option.value === form.audience) ??
    COURSE_AUDIENCE_OPTIONS[0]!;
  const editingCourse = isEditing
    ? props.listCourses.find((course) => course.id === form.editId) ?? null
    : null;

  return (
    <KvCard>
      <KvCardContent padding="md" className="space-y-kv-group">
        <div className="flex items-center gap-kv-pair border-b border-kv-border pb-kv-pair">
          <KvCardTitleIcon icon={isEditing ? faIcons.penToSquare : faIcons.plus} />
          <KvTypography variant="subtitle" weight="black" as="h4" className="min-w-0">
            {isEditing ? `ویرایش درس «${form.title || '—'}»` : 'تعریف درس جدید'}
          </KvTypography>
        </div>

        <KvFieldFrame
          id="course-def-audience"
          fieldId="course-def-audience-tabs"
          label="اختصاص به پنل"
          required
          hint={audienceOption.description}
        >
          <AppTabs
            id="course-def-audience-tabs"
            value={form.audience}
            onValueChange={(value) =>
              props.patchForm({ audience: value as AcademicTermType })
            }
            gridCols={2}
          >
            <AppTabsList aria-label="اختصاص درس به پنل">
              {COURSE_AUDIENCE_OPTIONS.map((option) => (
                <AppTabsTrigger key={option.value} value={option.value} disabled={busy}>
                  <FaIcon icon={AUDIENCE_ICONS[option.value]} size="xs" />
                  {option.label}
                </AppTabsTrigger>
              ))}
            </AppTabsList>
          </AppTabs>
        </KvFieldFrame>

        <KvTextField
          id="course-def-title"
          label="عنوان درس"
          required
          size="md"
          scriptGuard="none"
          disabled={busy}
          value={form.title}
          placeholder="مثلاً کارورزی یا کارگاه مهارت‌های نرم"
          maxLength={80}
          onChange={(event) => props.patchForm({ title: event.target.value })}
        />

        <div className="space-y-kv-group rounded-kv-control border border-kv-border-muted bg-kv-surface-subtle/60 p-kv-group">
          <div className="flex flex-wrap items-center justify-between gap-kv-pair">
            <KvSwitch
              id="course-def-has-subs"
              label="این درس زیرمجموعه دارد"
              checked={form.hasSubModules}
              disabled={busy}
              onCheckedChange={(checked) => props.setHasSubModules(checked)}
            />
            {form.hasSubModules ? (
              <KvTypography variant="caption" tone="muted">
                {toPersianDigits(String(form.subModules.length))} زیرمجموعه
              </KvTypography>
            ) : null}
          </div>

          <KvTypography variant="caption" tone="muted" as="p">
            {form.hasSubModules
              ? 'عنوان درس فقط سرگروه است؛ هر زیرمجموعه جداگانه در ترم ارائه می‌شود و سرفصل هفتگی خودش را دارد.'
              : 'بدون زیرمجموعه، خود این درس یک ماژول مستقل است و مستقیم در ترم ارائه می‌شود.'}
          </KvTypography>

          {form.hasSubModules ? (
            <div className="space-y-kv-pair">
              {form.subModules.map((sub, index) => (
                <div key={sub.key} className="flex items-start gap-kv-pair">
                  <span className="mt-3 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-kv-brand-soft text-xs font-bold text-kv-brand-soft-fg">
                    {toPersianDigits(String(index + 1))}
                  </span>
                  <div className="min-w-0 flex-1">
                    <KvTextField
                      id={`course-def-sub-${sub.key}`}
                      label={false}
                      size="md"
                      scriptGuard="none"
                      disabled={busy}
                      value={sub.title}
                      placeholder={`عنوان زیرمجموعه ${toPersianDigits(String(index + 1))}`}
                      maxLength={80}
                      onChange={(event) =>
                        props.updateSubModule(sub.key, event.target.value)
                      }
                    />
                  </div>
                  <div className="flex shrink-0 items-center gap-1 pt-1">
                    <KvButton
                      type="button"
                      appearance="text"
                      color="neutral"
                      size="sm"
                      disabled={busy || index === 0}
                      aria-label={`انتقال «${sub.title || 'زیرمجموعه'}» به بالا`}
                      icon={<FaIcon icon={faIcons.chevronUp} size="xs" />}
                      onClick={() => props.moveSubModule(sub.key, -1)}
                    />
                    <KvButton
                      type="button"
                      appearance="text"
                      color="neutral"
                      size="sm"
                      disabled={busy || index === form.subModules.length - 1}
                      aria-label={`انتقال «${sub.title || 'زیرمجموعه'}» به پایین`}
                      icon={<FaIcon icon={faIcons.chevronDown} size="xs" />}
                      onClick={() => props.moveSubModule(sub.key, 1)}
                    />
                    <KvButton
                      type="button"
                      appearance="text"
                      color="error"
                      size="sm"
                      disabled={busy}
                      aria-label={`حذف «${sub.title || 'زیرمجموعه'}»`}
                      icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
                      onClick={() => props.removeSubModule(sub.key)}
                    />
                  </div>
                </div>
              ))}

              <KvButton
                type="button"
                appearance="secondary"
                size="sm"
                disabled={busy}
                icon={<FaIcon icon={faIcons.plus} size="xs" />}
                onClick={props.addSubModule}
              >
                افزودن زیرمجموعه
              </KvButton>
            </div>
          ) : null}
        </div>

        <KvSwitch
          id="course-def-active"
          label="درس فعال است (در ارائه و سرفصل دروس دیده شود)"
          checked={form.isActive}
          disabled={busy}
          onCheckedChange={(checked) => props.patchForm({ isActive: checked })}
        />

        {props.formError ? (
          <KvTypography variant="caption" tone="danger" as="p">
            {props.formError}
          </KvTypography>
        ) : null}

        <div className="flex flex-col gap-2 border-t border-kv-border-muted pt-kv-group sm:flex-row sm:flex-wrap sm:justify-end">
          {editingCourse ? (
            <KvButton
              type="button"
              color="error"
              size="md"
              className="w-full sm:w-auto"
              disabled={busy}
              icon={<FaIcon icon={faIcons.trashCan} size="xs" />}
              onClick={() => props.requestDelete(editingCourse)}
            >
              حذف درس
            </KvButton>
          ) : null}
          {isEditing || props.isDirty ? (
            <KvButton
              type="button"
              appearance="secondary"
              size="md"
              className="w-full sm:w-auto"
              disabled={busy}
              onClick={() => props.resetForm()}
            >
              {isEditing ? 'انصراف از ویرایش' : 'پاک کردن فرم'}
            </KvButton>
          ) : null}
          <KvButton
            type="button"
            color="cta"
            size="md"
            className="w-full sm:w-auto"
            loading={isSaving}
            disabled={busy || !props.isDirty}
            onClick={() => void props.saveCourse()}
          >
            {isEditing ? 'ذخیره تغییرات درس' : 'ایجاد درس'}
          </KvButton>
        </div>
      </KvCardContent>
    </KvCard>
  );
}

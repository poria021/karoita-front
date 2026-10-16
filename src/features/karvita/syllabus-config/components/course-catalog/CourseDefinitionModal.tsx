'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvDialog,
  KvDialogContent,
  KvDialogDescription,
  KvDialogFooter,
  KvDialogHeader,
  KvDialogTitle,
} from '@/components/shared/KvDialog';
import { KvTypography } from '@/components/shared/KvTypography';
import { KvSwitch } from '@/components/shared/fields/KvSwitch';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { COURSE_AUDIENCE_OPTIONS } from '../../constants';
import type { UseCourseCatalogPageReturn } from '../../hooks/useCourseCatalogPage';

type CourseDefinitionModalProps = Pick<
  UseCourseCatalogPageReturn,
  | 'modalOpen'
  | 'closeModal'
  | 'form'
  | 'isEditing'
  | 'isDirty'
  | 'formError'
  | 'isSaving'
  | 'patchForm'
  | 'setHasSubModules'
  | 'addSubModule'
  | 'updateSubModule'
  | 'removeSubModule'
  | 'moveSubModule'
  | 'saveCourse'
>;

/** فرم افزودن/ویرایش درس — مودال تا جدول و فیلتر پنل زیرش دیده بماند. */
export function CourseDefinitionModal(props: CourseDefinitionModalProps) {
  const { form, isEditing, isSaving } = props;
  const audienceOption =
    COURSE_AUDIENCE_OPTIONS.find((option) => option.value === form.audience) ??
    COURSE_AUDIENCE_OPTIONS[0]!;

  return (
    <KvDialog
      open={props.modalOpen}
      onOpenChange={(next) => {
        if (!next) props.closeModal();
      }}
    >
      <KvDialogContent
        size="lg"
        className="max-h-[90dvh] overflow-y-auto"
        onPointerDownOutside={(event) => {
          if (isSaving) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isSaving) event.preventDefault();
        }}
      >
        <KvDialogHeader>
          <KvDialogTitle>
            {isEditing
              ? `ویرایش درس «${form.title || '—'}» ${audienceOption.label}`
              : `افزودن درس ${audienceOption.label}`}
          </KvDialogTitle>
          <KvDialogDescription className="sr-only">
            فرم {isEditing ? 'ویرایش' : 'افزودن'} درس و زیرمجموعه‌های آن
          </KvDialogDescription>
        </KvDialogHeader>

        <form
          className="flex flex-col gap-kv-group"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void props.saveCourse();
          }}
        >
          <KvTextField
            id="course-def-title"
            label="عنوان درس"
            required
            size="md"
            scriptGuard="none"
            disabled={isSaving}
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
                disabled={isSaving}
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
                ? 'عنوان درس فقط سرگروه است؛ هر زیرمجموعه جداگانه در ترم ارائه می‌شود، سرفصل هفتگی و ظرفیت خودش را دارد و در فیلتر ارزیابی گزارش‌ها می‌آید.'
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
                        disabled={isSaving}
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
                        disabled={isSaving || index === 0}
                        aria-label={`انتقال «${sub.title || 'زیرمجموعه'}» به بالا`}
                        icon={<FaIcon icon={faIcons.chevronUp} size="xs" />}
                        onClick={() => props.moveSubModule(sub.key, -1)}
                      />
                      <KvButton
                        type="button"
                        appearance="text"
                        color="neutral"
                        size="sm"
                        disabled={
                          isSaving || index === form.subModules.length - 1
                        }
                        aria-label={`انتقال «${sub.title || 'زیرمجموعه'}» به پایین`}
                        icon={<FaIcon icon={faIcons.chevronDown} size="xs" />}
                        onClick={() => props.moveSubModule(sub.key, 1)}
                      />
                      <KvButton
                        type="button"
                        appearance="text"
                        color="error"
                        size="sm"
                        disabled={isSaving}
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
                  disabled={isSaving}
                  icon={<FaIcon icon={faIcons.plus} size="xs" />}
                  onClick={props.addSubModule}
                >
                  افزودن زیرمجموعه
                </KvButton>
              </div>
            ) : null}
          </div>

          {props.formError ? (
            <div role="alert">
              <KvTypography variant="error">{props.formError}</KvTypography>
            </div>
          ) : null}

          <KvDialogFooter>
            <KvButton
              type="button"
              appearance="secondary"
              size="md"
              disabled={isSaving}
              onClick={props.closeModal}
            >
              انصراف
            </KvButton>
            <KvButton
              type="submit"
              color="cta"
              appearance="solid"
              size="md"
              loading={isSaving}
              disabled={isSaving || !props.isDirty}
            >
              {isEditing ? 'ذخیره تغییرات' : 'ایجاد درس'}
            </KvButton>
          </KvDialogFooter>
        </form>
      </KvDialogContent>
    </KvDialog>
  );
}

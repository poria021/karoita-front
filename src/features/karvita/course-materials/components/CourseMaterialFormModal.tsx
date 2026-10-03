'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

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
import {
  KvMultiFileDropzone,
  type KvAttachmentItem,
} from '@/components/shared/fields/KvMultiFileDropzone';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvTextArea } from '@/components/shared/fields/KvTextArea';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import {
  COURSE_MATERIAL_ACCEPT_MAP,
  COURSE_MATERIAL_DESCRIPTION_MAX,
  COURSE_MATERIAL_MAX_BYTES,
  validateCourseMaterialInput,
} from '@/services/course-materials/course-material-rules';
import { CourseMaterialsService } from '@/services/course-materials.service';
import { useUserStore } from '@/store/useUserStore';
import type { InternshipCourseKind } from '@/types/internship-enrollment';

export type CourseMaterialCourseOption = { value: string; label: string };

type CourseMaterialFormModalProps = {
  open: boolean;
  onClose: () => void;
  kind: InternshipCourseKind;
  courses: CourseMaterialCourseOption[];
  /** درس پیش‌فرض (فیلتر فعال صفحه)؛ `all` یعنی انتخاب با کاربر. */
  defaultCourse: string;
};

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'عملیات ناموفق بود. دوباره تلاش کنید.';
}

/** فرم افزودن جزوه/فایل برای فراگیران درس. */
export function CourseMaterialFormModal(props: CourseMaterialFormModalProps) {
  // محتوا فقط وقتی باز است mount می‌شود تا هر بار فرم تازه باشد.
  return (
    <KvDialog
      open={props.open}
      onOpenChange={(next) => {
        if (!next) props.onClose();
      }}
    >
      {props.open ? <FormContent {...props} /> : null}
    </KvDialog>
  );
}

function FormContent({
  onClose,
  kind,
  courses,
  defaultCourse,
}: CourseMaterialFormModalProps) {
  const queryClient = useQueryClient();
  const role = useUserStore((state) => state.activeUser?.role);
  const [courseKey, setCourseKey] = useState(
    courses.some((c) => c.value === defaultCourse)
      ? defaultCourse
      : courses.length === 1
        ? (courses[0]?.value ?? '')
        : ''
  );
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [attachment, setAttachment] = useState<KvAttachmentItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const publish = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('یک فایل انتخاب کنید.');
      return CourseMaterialsService.publish({
        kind,
        courseKey,
        courseLabel: courses.find((c) => c.value === courseKey)?.label ?? '',
        // عنوان ردیف همان نام فایل است؛ فرم فقط توضیحات دارد.
        title: file.name,
        description,
        file,
      });
    },
    onSuccess: async () => {
      toast.success('فایل برای فراگیران درس بارگذاری شد.');
      await queryClient.invalidateQueries({
        queryKey: DASHBOARD_QUERY.courseMaterials,
      });
      onClose();
    },
    onError: (err) => setFormError(errorMessage(err)),
  });
  const busy = publish.isPending;

  function submit() {
    const error = validateCourseMaterialInput(
      { courseKey, title: file?.name ?? '', description, file },
      role
    );
    if (error) {
      setFormError(error);
      return;
    }
    setFormError(null);
    publish.mutate();
  }

  return (
    <KvDialogContent
      size="lg"
      className="max-h-[90dvh] overflow-y-auto"
      onPointerDownOutside={(event) => {
        if (busy) event.preventDefault();
      }}
      onEscapeKeyDown={(event) => {
        if (busy) event.preventDefault();
      }}
    >
      <KvDialogHeader>
        <KvDialogTitle>افزودن جزوه یا فایل</KvDialogTitle>
        <KvDialogDescription className="sr-only">
          فرم بارگذاری فایل برای فراگیران درس
        </KvDialogDescription>
      </KvDialogHeader>

      <form
        className="flex flex-col gap-kv-group"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        {courses.length > 1 ? (
          <KvSelectField
            label="درس"
            required
            placeholder="درس را انتخاب کنید"
            value={courseKey}
            disabled={busy}
            onValueChange={(value) => {
              setCourseKey(value);
              setFormError(null);
            }}
          >
            {courses.map((course) => (
              <KvSelectItem key={course.value} value={course.value}>
                {course.label}
              </KvSelectItem>
            ))}
          </KvSelectField>
        ) : null}

        <KvTextArea
          label="توضیحات"
          optionalHint
          rows={3}
          scriptGuard="none"
          locked={busy}
          value={description}
          maxLength={COURSE_MATERIAL_DESCRIPTION_MAX}
          onChange={(event) => {
            setDescription(event.target.value);
            setFormError(null);
          }}
        />

        <KvMultiFileDropzone
          files={attachment}
          disabled={busy}
          maxFileSizeMb={COURSE_MATERIAL_MAX_BYTES / (1024 * 1024)}
          accept={COURSE_MATERIAL_ACCEPT_MAP}
          acceptLabel="PDF، Word، PowerPoint، Excel، متن، ZIP، تصویر، ویدیو و صوت — حداکثر ۲ مگابایت"
          invalidTypeMessage="فرمت فایل انتخابی مجاز نیست."
          onAdd={(items) => {
            // فقط یک فایل در هر مورد؛ فایل جدید جایگزین قبلی می‌شود.
            setAttachment(items.slice(-1));
            setFormError(null);
          }}
          onAddFiles={(files) => setFile(files.at(-1) ?? null)}
          onRemove={() => {
            setAttachment([]);
            setFile(null);
          }}
        />

        {formError ? (
          <div role="alert">
            <KvTypography variant="error">{formError}</KvTypography>
          </div>
        ) : null}

        <KvDialogFooter>
          <KvButton
            type="button"
            appearance="secondary"
            size="md"
            disabled={busy}
            onClick={onClose}
          >
            انصراف
          </KvButton>
          <KvButton
            type="submit"
            color="cta"
            appearance="solid"
            size="md"
            loading={busy}
            disabled={busy}
          >
            انتشار
          </KvButton>
        </KvDialogFooter>
      </form>
    </KvDialogContent>
  );
}

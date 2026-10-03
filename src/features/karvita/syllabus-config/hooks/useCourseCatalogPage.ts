'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { SyllabusConfigService } from '@/services/syllabus-config.service';
import type {
  AcademicTermType,
  CourseDefinition,
  SyllabusConfigSnapshot,
  UpsertCourseDefinitionInput,
} from '@/types/syllabus-config';

import { publishSyllabusSnapshot } from '../lib/syllabusPageCache';
import { errorMessage } from '../lib/syllabusPageUtils';

/** ردیف فرم زیرمجموعه؛ `key` فقط برای React است و `id` شناسهٔ پایدار سرور. */
export type SubModuleDraft = {
  key: string;
  id?: string;
  title: string;
};

type CourseForm = {
  editId: string;
  title: string;
  audience: AcademicTermType;
  isActive: boolean;
  hasSubModules: boolean;
  subModules: SubModuleDraft[];
};

let draftKeySeq = 0;
function nextDraftKey(): string {
  draftKeySeq += 1;
  return `sub_draft_${draftKeySeq}`;
}

function emptyForm(audience: AcademicTermType): CourseForm {
  return {
    editId: '',
    title: '',
    audience,
    isActive: true,
    hasSubModules: false,
    subModules: [],
  };
}

function formFromCourse(course: CourseDefinition): CourseForm {
  return {
    editId: course.id,
    title: course.title,
    audience: course.audience,
    isActive: course.isActive,
    hasSubModules: course.subModules.length > 0,
    subModules: course.subModules.map((sub) => ({
      key: nextDraftKey(),
      id: sub.id,
      title: sub.title,
    })),
  };
}

function toInput(form: CourseForm): UpsertCourseDefinitionInput {
  return {
    title: form.title,
    audience: form.audience,
    isActive: form.isActive,
    subModules: form.hasSubModules
      ? form.subModules.map((sub) => ({ id: sub.id, title: sub.title }))
      : [],
  };
}

function formSignature(form: CourseForm): string {
  return JSON.stringify(toInput(form));
}

export function useCourseCatalogPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: DASHBOARD_QUERY.syllabusCourseCatalog,
    queryFn: () => SyllabusConfigService.listCourseDefinitions(),
    staleTime: QUERY_STALE_MS.module,
    retry: false,
  });
  const courses = useMemo(() => query.data ?? [], [query.data]);

  const [listAudience, setListAudience] = useState<AcademicTermType>('semester');
  const [form, setForm] = useState<CourseForm>(() => emptyForm('semester'));
  const [baseline, setBaseline] = useState(() =>
    formSignature(emptyForm('semester'))
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingActiveId, setPendingActiveId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CourseDefinition | null>(
    null
  );

  const listCourses = useMemo(
    () => courses.filter((course) => course.audience === listAudience),
    [courses, listAudience]
  );
  const audienceCounts = useMemo(() => {
    const counts: Record<AcademicTermType, number> = { semester: 0, modular: 0 };
    for (const course of courses) counts[course.audience] += 1;
    return counts;
  }, [courses]);

  const isEditing = Boolean(form.editId);
  const isDirty = formSignature(form) !== baseline;

  function patchForm(patch: Partial<CourseForm>) {
    setForm((prev) => ({ ...prev, ...patch }));
    setFormError(null);
  }

  function resetForm(audience: AcademicTermType = listAudience) {
    const next = emptyForm(audience);
    setForm(next);
    setBaseline(formSignature(next));
    setFormError(null);
  }

  function startEdit(course: CourseDefinition) {
    const next = formFromCourse(course);
    setForm(next);
    setBaseline(formSignature(next));
    setFormError(null);
    setListAudience(course.audience);
  }

  function changeListAudience(audience: AcademicTermType) {
    setListAudience(audience);
    if (!isEditing && !isDirty) resetForm(audience);
  }

  function setHasSubModules(hasSubModules: boolean) {
    setForm((prev) => ({
      ...prev,
      hasSubModules,
      // اولین بار که روشن می‌شود دو ردیف خالی بده تا ساختار واضح باشد.
      subModules:
        hasSubModules && prev.subModules.length === 0
          ? [
              { key: nextDraftKey(), title: '' },
              { key: nextDraftKey(), title: '' },
            ]
          : prev.subModules,
    }));
    setFormError(null);
  }

  function addSubModule() {
    setForm((prev) => ({
      ...prev,
      subModules: [...prev.subModules, { key: nextDraftKey(), title: '' }],
    }));
  }

  function updateSubModule(key: string, title: string) {
    setForm((prev) => ({
      ...prev,
      subModules: prev.subModules.map((sub) =>
        sub.key === key ? { ...sub, title } : sub
      ),
    }));
    setFormError(null);
  }

  function removeSubModule(key: string) {
    setForm((prev) => {
      const subModules = prev.subModules.filter((sub) => sub.key !== key);
      return {
        ...prev,
        subModules,
        hasSubModules: subModules.length > 0 ? prev.hasSubModules : false,
      };
    });
  }

  function moveSubModule(key: string, direction: -1 | 1) {
    setForm((prev) => {
      const index = prev.subModules.findIndex((sub) => sub.key === key);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.subModules.length) {
        return prev;
      }
      const subModules = [...prev.subModules];
      const [moved] = subModules.splice(index, 1);
      subModules.splice(target, 0, moved!);
      return { ...prev, subModules };
    });
  }

  function applySnapshot(snapshot: SyllabusConfigSnapshot) {
    publishSyllabusSnapshot(queryClient, snapshot);
    if (snapshot.courseCatalog) {
      queryClient.setQueryData(
        DASHBOARD_QUERY.syllabusCourseCatalog,
        snapshot.courseCatalog
      );
    } else {
      void queryClient.invalidateQueries({
        queryKey: DASHBOARD_QUERY.syllabusCourseCatalog,
      });
    }
  }

  async function saveCourse() {
    if (!form.title.trim()) {
      setFormError('عنوان درس الزامی است.');
      return;
    }
    if (form.hasSubModules && form.subModules.length === 0) {
      setFormError('حداقل یک زیرمجموعه اضافه کنید یا گزینهٔ زیرمجموعه را خاموش کنید.');
      return;
    }
    setIsSaving(true);
    try {
      const input = toInput(form);
      const snapshot = isEditing
        ? await SyllabusConfigService.updateCourseDefinition(form.editId, input)
        : await SyllabusConfigService.createCourseDefinition(input);
      applySnapshot(snapshot);
      toast.success(
        isEditing
          ? `درس «${input.title.trim()}» به‌روزرسانی شد.`
          : `درس «${input.title.trim()}» تعریف شد.`
      );
      setListAudience(input.audience);
      resetForm(input.audience);
    } catch (err) {
      setFormError(errorMessage(err, 'ذخیرهٔ درس ناموفق بود.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleCourseActive(course: CourseDefinition, isActive: boolean) {
    if (pendingActiveId) return;
    setPendingActiveId(course.id);
    try {
      const snapshot = await SyllabusConfigService.setCourseDefinitionActive(
        course.id,
        isActive
      );
      applySnapshot(snapshot);
      if (form.editId === course.id) {
        setForm((prev) => ({ ...prev, isActive }));
        setBaseline((prev) => {
          const parsed = JSON.parse(prev) as UpsertCourseDefinitionInput;
          return JSON.stringify({ ...parsed, isActive });
        });
      }
      toast.success(
        isActive
          ? `درس «${course.title}» فعال شد و در ارائهٔ دروس دیده می‌شود.`
          : `درس «${course.title}» غیرفعال شد.`
      );
    } catch (err) {
      toast.error(errorMessage(err, 'تغییر وضعیت درس ناموفق بود.'));
    } finally {
      setPendingActiveId(null);
    }
  }

  function requestDelete(course: CourseDefinition) {
    setDeleteTarget(course);
  }

  async function confirmDelete() {
    const target = deleteTarget;
    setDeleteTarget(null);
    if (!target) return;
    try {
      const snapshot = await SyllabusConfigService.deleteCourseDefinition(
        target.id
      );
      applySnapshot(snapshot);
      if (form.editId === target.id) resetForm(target.audience);
      toast.warning(`درس «${target.title}» حذف شد.`);
    } catch (err) {
      toast.error(errorMessage(err, 'حذف درس ناموفق بود.'));
    }
  }

  return {
    isLoading: query.isPending,
    error: query.error ? errorMessage(query.error, 'بارگذاری دروس ناموفق بود.') : null,
    reload: () => void query.refetch(),
    listAudience,
    changeListAudience,
    audienceCounts,
    listCourses,
    form,
    isEditing,
    isDirty,
    formError,
    isSaving,
    patchForm,
    resetForm,
    startEdit,
    setHasSubModules,
    addSubModule,
    updateSubModule,
    removeSubModule,
    moveSubModule,
    saveCourse,
    pendingActiveId,
    toggleCourseActive,
    deleteTarget,
    requestDelete,
    clearDelete: () => setDeleteTarget(null),
    confirmDelete,
  };
}

export type UseCourseCatalogPageReturn = ReturnType<typeof useCourseCatalogPage>;

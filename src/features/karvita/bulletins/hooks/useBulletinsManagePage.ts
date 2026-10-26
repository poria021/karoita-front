'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import {
  audienceRolesFor,
  canPublishAdvertisements,
  canTargetProvinces,
  validateBulletinInput,
} from '@/services/bulletins/bulletin-rules';
import {
  buildProvinceSelectOptions,
  canonicalizeProvinceTitles,
} from '@/services/bulletins/province-select';
import { BulletinsService } from '@/services/bulletins.service';
import { useUserStore } from '@/store/useUserStore';
import type { UserRole } from '@/types/auth';
import type { Bulletin, BulletinKind, UpsertBulletinInput } from '@/types/bulletins';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

type BulletinForm = {
  editId: string;
  kind: BulletinKind;
  title: string;
  /** متن اطلاعیه، یا توضیحات تبلیغ (اختیاری وقتی تصویر هست). */
  body: string;
  linkUrl: string;
  /** تصویر ذخیره‌شده (ویرایش) — با حذف تصویر خالی می‌شود. */
  imageUrl: string;
  /** فایل تازه؛ Facade در mock به data URL و در real به FilesService می‌سپارد. */
  imageFile: File | null;
  audienceRoles: UserRole[];
  /** عنوان استان‌های مخاطب. */
  provinces: string[];
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'عملیات ناموفق بود.';
}

function toInput(
  form: BulletinForm,
  provinceCatalog: readonly string[] = []
): UpsertBulletinInput {
  return {
    kind: form.kind,
    title: form.title,
    body: form.body,
    ...(form.kind === 'advertisement'
      ? {
          linkUrl: form.linkUrl,
          imageUrl: form.imageUrl,
          ...(form.imageFile ? { imageFile: form.imageFile } : {}),
        }
      : {}),
    audienceRoles: form.audienceRoles,
    provinces: canonicalizeProvinceTitles(form.provinces, provinceCatalog),
  };
}

function formSignature(form: BulletinForm): string {
  const file = form.imageFile;
  return JSON.stringify({
    ...toInput(form),
    imageFile: undefined,
    file: file ? `${file.name}:${file.size}:${file.lastModified}` : null,
  });
}

export function useBulletinsManagePage() {
  const queryClient = useQueryClient();
  const role = useUserStore((state) => state.activeUser?.role);
  const canAds = canPublishAdvertisements(role);
  const showProvinces = canTargetProvinces(role);

  const query = useQuery({
    queryKey: [...DASHBOARD_QUERY.bulletinsManaged, role],
    queryFn: () => BulletinsService.listManagedBulletins(),
    staleTime: QUERY_STALE_MS.list,
    retry: false,
    enabled: Boolean(role),
  });

  const [tab, setTab] = useState<BulletinKind>('announcement');
  const activeTab: BulletinKind = canAds ? tab : 'announcement';

  const emptyForm = (kind: BulletinKind): BulletinForm => ({
    editId: '',
    kind,
    title: '',
    body: '',
    linkUrl: '',
    imageUrl: '',
    imageFile: null,
    // پیش‌فرض: همهٔ زیرمجموعه‌ها.
    audienceRoles: [...audienceRolesFor(role, kind)],
    provinces: [],
  });

  const [form, setForm] = useState<BulletinForm>(() => emptyForm('announcement'));
  const [baseline, setBaseline] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Bulletin | null>(null);

  // فهرست استان‌ها فقط وقتی فرم باز می‌شود گرفته می‌شود؛ بعد از CRUD استان باطل می‌شود.
  const provincesQuery = useQuery({
    queryKey: [...DASHBOARD_QUERY.orgOptions, 'bulletin-provinces'],
    queryFn: () => BulletinsService.listProvinceOptions(),
    staleTime: QUERY_STALE_MS.module,
    retry: false,
    enabled: modalOpen && showProvinces,
  });

  const rows = useMemo(() => query.data ?? [], [query.data]);
  const listRows = useMemo(
    () => rows.filter((row) => row.kind === activeTab),
    [rows, activeTab]
  );
  const counts = useMemo(() => {
    const next: Record<BulletinKind, number> = { announcement: 0, advertisement: 0 };
    for (const row of rows) next[row.kind] += 1;
    return next;
  }, [rows]);

  const audienceOptions = useMemo(
    () =>
      audienceRolesFor(role, form.kind).map((value) => ({
        value,
        label: getRoleStrategy(value).label,
      })),
    [role, form.kind]
  );

  // فقط نقش‌های مجاز فعلی؛ نقش اضافی Nest در شرط «همه» نویز ایجاد نکند.
  const audienceValues = useMemo(() => {
    const allowed = new Set(audienceOptions.map((option) => option.value));
    return form.audienceRoles.filter((item) => allowed.has(item));
  }, [form.audienceRoles, audienceOptions]);

  const provinceCatalog = provincesQuery.data ?? [];
  // عنوان فرم را با کاتالوگ هم‌تراز می‌کنیم تا شرط «همه» به‌خاطر ی/ک یا فاصله نشکند.
  const provinceValues = useMemo(
    () => canonicalizeProvinceTitles(form.provinces, provinceCatalog),
    [form.provinces, provinceCatalog]
  );
  // استانی که قبلاً ذخیره شده ولی دیگر در کاتالوگ نیست هم در گزینه‌ها می‌ماند تا بی‌صدا حذف نشود.
  const provinceOptions = useMemo(
    () => buildProvinceSelectOptions(provinceCatalog, form.provinces),
    [provinceCatalog, form.provinces]
  );

  function openForm(next: BulletinForm) {
    setForm(next);
    setBaseline(next.editId ? formSignature(next) : '');
    setFormError(null);
    setModalOpen(true);
  }

  function openCreate() {
    openForm(emptyForm(activeTab));
  }

  function startEdit(bulletin: Bulletin) {
    openForm({
      editId: bulletin.id,
      kind: bulletin.kind,
      title: bulletin.title,
      body: bulletin.body,
      linkUrl: bulletin.linkUrl ?? '',
      imageUrl: bulletin.imageUrl ?? '',
      imageFile: null,
      audienceRoles: [...bulletin.audienceRoles],
      provinces: [...bulletin.provinces],
    });
  }

  function closeModal() {
    if (isSaving) return;
    setModalOpen(false);
  }

  function patchForm(patch: Partial<BulletinForm>) {
    setForm((prev) => ({ ...prev, ...patch }));
    setFormError(null);
  }

  /** انتخاب فایل جدید یا حذف تصویر (فایل `null` = بدون تصویر). */
  function setImageFile(file: File | null) {
    patchForm(file ? { imageFile: file } : { imageFile: null, imageUrl: '' });
  }

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY.bulletins });
  }

  async function saveBulletin() {
    if (!role) return;
    setIsSaving(true);
    try {
      const input = toInput(form, provinceCatalog);
      // ویرایش: سلسله‌مراتب مخاطب با نقش نویسندهٔ اصلی (نه لزوماً نقش جاری).
      const validateAs =
        (form.editId
          ? rows.find((row) => row.id === form.editId)?.authorRole
          : null) ?? role;
      const error = validateBulletinInput(input, validateAs);
      if (error) {
        setFormError(error);
        return;
      }
      if (form.editId) {
        await BulletinsService.updateBulletin(form.editId, input);
        toast.success('تغییرات ذخیره شد.');
      } else {
        await BulletinsService.createBulletin(input);
        toast.success(
          form.kind === 'advertisement' ? 'تبلیغ منتشر شد.' : 'اطلاعیه منتشر شد.'
        );
      }
      await invalidate();
      setModalOpen(false);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(bulletin: Bulletin) {
    const next = !bulletin.isActive;
    try {
      await BulletinsService.setBulletinActive(bulletin.id, next);
      toast.success(next ? 'فعال شد.' : 'غیرفعال شد.');
      await invalidate();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await BulletinsService.deleteBulletin(deleteTarget.id);
      toast.success('حذف شد.');
      await invalidate();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeleteTarget(null);
    }
  }

  return {
    canAds,
    canTargetProvinces: showProvinces,
    activeTab,
    setTab,
    counts,
    listRows,
    isLoading: query.isLoading,
    error: query.error ? errorMessage(query.error) : null,
    reload: () => void query.refetch(),
    form,
    isEditing: Boolean(form.editId),
    isDirty: formSignature(form) !== baseline,
    formError,
    isSaving,
    modalOpen,
    audienceOptions,
    audienceValues,
    provinceOptions,
    provinceValues,
    isProvincesLoading: provincesQuery.isLoading,
    openCreate,
    startEdit,
    closeModal,
    patchForm,
    setImageFile,
    saveBulletin,
    toggleActive,
    deleteTarget,
    requestDelete: setDeleteTarget,
    clearDelete: () => setDeleteTarget(null),
    confirmDelete,
  };
}

export type UseBulletinsManagePageReturn = ReturnType<typeof useBulletinsManagePage>;

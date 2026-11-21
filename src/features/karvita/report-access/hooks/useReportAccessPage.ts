'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { withCatalogOptionalReports } from '@/features/karvita/report-access/lib/with-catalog-optionals';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { ReportAccessService } from '@/services/report-access.service';
import { useUserStore } from '@/store/useUserStore';
import type {
  ReportAccessRoleId,
  ReportAccessRoleRow,
  ReportAccessRow,
  ReportSlug,
} from '@/types/report-access';

const DEFAULT_ROLE: ReportAccessRoleId = 'supervisor_professor';
const NO_ROWS: readonly ReportAccessRow[] = [];

function pendingKey(roleId: ReportAccessRoleId, slug: ReportSlug): string {
  return `${roleId}:${slug}`;
}

/**
 * صفحهٔ مدیریت دسترسی گزارش‌ها (`GET /reports/access`).
 * - سوییچ فقط برای `access=optional` و فقط وقتی کاربر لاگین‌شده مدیر ارشد است.
 * - با هر تغییر `PATCH /reports/access/:role` زده می‌شود و بعد ماتریس (و منوی `/me`) دوباره گرفته می‌شود؛
 *   هیچ آپدیت خوش‌بینانه‌ای نداریم.
 */
export function useReportAccessPage() {
  const queryClient = useQueryClient();
  const activeUser = useUserStore((state) => state.activeUser);
  const canEdit = activeUser?.role === 'super_admin';

  const [selectedRole, setRoleId] = useState<ReportAccessRoleId>(DEFAULT_ROLE);
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());

  const query = useQuery<ReportAccessRoleRow[]>({
    queryKey: DASHBOARD_QUERY.reportAccessMatrix,
    queryFn: async () =>
      withCatalogOptionalReports(await ReportAccessService.getMatrix()),
    staleTime: 0,
  });

  const roles = useMemo(
    () => (query.data ?? []).map((entry) => entry.roleId),
    [query.data]
  );

  // اگر نقش انتخاب‌شده در پاسخ نیست، به اولین نقش برگرد.
  const roleId = roles.includes(selectedRole)
    ? selectedRole
    : (roles[0] ?? selectedRole);

  /** ردیف‌های نقش انتخاب‌شده؛ گزارشی که نیست ممنوع است. */
  const rowBySlug = useMemo(() => {
    const rows =
      query.data?.find((entry) => entry.roleId === roleId)?.reports ?? NO_ROWS;
    const map = new Map<ReportSlug, ReportAccessRow>();
    for (const row of rows) map.set(row.slug, row);
    return map;
  }, [query.data, roleId]);

  const refetchAll = useCallback(
    () =>
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY.reportAccess }),
    [queryClient]
  );

  const toggleReport = useCallback(
    async (slug: ReportSlug) => {
      const row = rowBySlug.get(slug);
      // default و ممنوع هرگز PATCH نمی‌خورند.
      if (!canEdit || !row || row.access !== 'optional') return;

      const key = pendingKey(roleId, slug);
      setPending((prev) => new Set(prev).add(key));
      try {
        await ReportAccessService.setReportEnabled(roleId, slug, !row.enabled);
        await refetchAll();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'ثبت تغییر دسترسی ناموفق بود.'
        );
        // ۴۰۰/۴۰۴ یعنی ماتریس روی صفحه کهنه است؛ دوباره بگیر.
        await refetchAll();
      } finally {
        setPending((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [canEdit, refetchAll, roleId, rowBySlug]
  );

  const isPending = useCallback(
    (slug: ReportSlug) => pending.has(pendingKey(roleId, slug)),
    [pending, roleId]
  );

  return {
    isLoading: query.isLoading,
    error: query.isError
      ? query.error instanceof Error
        ? query.error.message
        : 'بارگذاری ماتریس دسترسی ناموفق بود.'
      : null,
    reload: () => query.refetch(),
    canEdit,
    roles,
    roleId,
    setRoleId,
    rowBySlug,
    toggleReport,
    isPending,
  };
}

export type ReportAccessPageModel = ReturnType<typeof useReportAccessPage>;

'use client';

import { usePathname } from 'next/navigation';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvBreadcrumb } from '@/components/shared/shell/KvBreadcrumb';
import { PageHeader } from '@/components/shared/shell/PageHeader';
import { RefreshPageButton } from '@/components/shared/shell/RefreshPageButton';
import { useDailyApprovalsHeaderCourse } from '@/features/karvita/daily-approvals/hooks/useDailyApprovalsHeaderCourse';
import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';
import { getModuleBreadcrumb } from '@/utils/moduleBreadcrumb';
import { faIcons } from '@/utils/iconMap';
import { getModuleMeta } from '@/utils/moduleMeta';

function resolveMetaIcon(iconName?: string) {
  if (!iconName) return faIcons.folderOpen;
  const key = iconName
    .replace(/^fa-/, '')
    .replace(/-([a-z])/g, (_, c) => c.toUpperCase()) as keyof typeof faIcons;
  return (
    faIcons[key] ??
    (faIcons as Record<string, typeof faIcons.folderOpen>)[iconName] ??
    faIcons.folderOpen
  );
}

function isWorkbenchHomePath(pathname: string): boolean {
  return (
    pathname === RouteService.karvita.dashboard() ||
    pathname === RouteService.karvita.adminDashboard()
  );
}

export function ModulePageHeader() {
  const pathname = usePathname();
  const role = useUserStore((state) => state.activeUser?.role);
  const courseTitle = useDailyApprovalsHeaderCourse(
    pathname === RouteService.karvita.dailyApprovals()
  );

  // میز کار همهٔ پنل‌ها: عنوان و بردکرامب اضافه است؛ ویجت‌ها خودشان معرفی می‌کنند.
  if (isWorkbenchHomePath(pathname)) return null;

  const meta = getModuleMeta(pathname, role);
  const crumbs = getModuleBreadcrumb(pathname, role);
  const icon = resolveMetaIcon(meta.icon);

  return (
    <PageHeader
      title={meta.title}
      titleAddon={
        courseTitle ? (
          <span className="flex min-w-0 shrink items-center gap-kv-pair rounded-kv-control bg-kv-brand-soft px-kv-inline py-kv-pair text-xs font-bold text-kv-brand-soft-fg">
            <span
              aria-hidden
              className="size-1.5 shrink-0 rounded-full bg-kv-brand"
            />
            <span className="truncate">{courseTitle}</span>
          </span>
        ) : undefined
      }
      breadcrumb={<KvBreadcrumb items={crumbs} />}
      icon={<FaIcon icon={icon} size="lg" />}
      actions={<RefreshPageButton />}
      className="mb-kv-group shrink-0"
    />
  );
}

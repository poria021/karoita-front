'use client';

import { usePathname } from 'next/navigation';

import { FaIcon } from '@/components/shared/FaIcon';
import { MockDataBadge } from '@/components/shared/MockDataBadge';
import { KvBreadcrumb } from '@/components/shared/shell/KvBreadcrumb';
import { PageHeader } from '@/components/shared/shell/PageHeader';
import { RefreshPageButton } from '@/components/shared/shell/RefreshPageButton';
import {
  isAdminReportsPath,
  isOrgReportsPath,
} from '@/features/karvita/reports/lib/report-path';
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
  return faIcons[key] ?? (faIcons as Record<string, typeof faIcons.folderOpen>)[iconName] ?? faIcons.folderOpen;
}

function isWorkbenchHomePath(pathname: string): boolean {
  return (
    pathname === RouteService.karvita.dashboard() ||
    pathname === RouteService.karvita.adminDashboard()
  );
}

function normalizePath(pathname: string): string {
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

/** صفحات بدون شاخهٔ real — بج ماکت کنار عنوان هدر. */
function showsMockDataBadge(pathname: string): boolean {
  if (isAdminReportsPath(pathname) || isOrgReportsPath(pathname)) return true;
  const onboardingBase = normalizePath(
    RouteService.karvita.onboardingApprovals()
  );
  return normalizePath(pathname) === onboardingBase;
}

export function ModulePageHeader() {
  const pathname = usePathname();
  const role = useUserStore((state) => state.activeUser?.role);

  // میز کار همهٔ پنل‌ها: عنوان و بردکرامب اضافه است؛ ویجت‌ها خودشان معرفی می‌کنند.
  if (isWorkbenchHomePath(pathname)) return null;

  const meta = getModuleMeta(pathname, role);
  const crumbs = getModuleBreadcrumb(pathname, role);
  const icon = resolveMetaIcon(meta.icon);

  return (
    <PageHeader
      title={meta.title}
      titleAddon={showsMockDataBadge(pathname) ? <MockDataBadge /> : undefined}
      breadcrumb={<KvBreadcrumb items={crumbs} />}
      icon={<FaIcon icon={icon} size="lg" />}
      actions={<RefreshPageButton />}
      className="mb-kv-group shrink-0"
    />
  );
}
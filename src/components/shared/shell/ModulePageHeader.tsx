'use client';

import { usePathname } from 'next/navigation';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvBreadcrumb } from '@/components/shared/shell/KvBreadcrumb';
import { PageHeader } from '@/components/shared/shell/PageHeader';
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

export function ModulePageHeader() {
  const pathname = usePathname();
  const role = useUserStore((state) => state.activeUser?.role);
  const meta = getModuleMeta(pathname, role);
  const crumbs = getModuleBreadcrumb(pathname, role);
  const icon = resolveMetaIcon(meta.icon);

  return (
    <PageHeader
      title={meta.title}
      breadcrumb={<KvBreadcrumb items={crumbs} />}
      icon={<FaIcon icon={icon} size="lg" />}
      className="mb-kv-group shrink-0"
    />
  );
}
'use client';

import { usePathname } from 'next/navigation';

import { FaIcon } from '@/components/shared/FaIcon';
import { PageHeader } from '@/components/shared/shell/PageHeader';
import { useUserStore } from '@/store/useUserStore';
import { faIcons, iconMap } from '@/utils/iconMap';
import { getModuleMeta } from '@/utils/moduleMeta';

export function ModulePageHeader() {
  const pathname = usePathname();
  const role = useUserStore((state) => state.activeUser?.role);
  const meta = getModuleMeta(pathname, role);
  const icon = iconMap[meta.icon] ?? faIcons.folderOpen;

  return (
    <PageHeader
      title={meta.title}
      description={meta.description}
      icon={<FaIcon icon={icon} size="lg" />}
      className="mb-5 shrink-0"
    />
  );
}

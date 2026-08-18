import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { faIcons } from '@/utils/iconMap';

export function resolveSidebarIcon(iconKey: string): IconDefinition {
  const key = iconKey
    .replace(/^fa-/, '')
    .replace(/-([a-z])/g, (_, c) => c.toUpperCase()) as keyof typeof faIcons;

  return (
    faIcons[key] ??
    (faIcons as Record<string, IconDefinition>)[iconKey] ??
    faIcons.tableColumns
  );
}
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { faIcons, iconMap } from '@/utils/iconMap';

export function resolveSidebarIcon(iconKey: string): IconDefinition {
  return iconMap[iconKey] ?? faIcons.tableColumns;
}

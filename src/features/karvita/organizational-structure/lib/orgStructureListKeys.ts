import type { OrgStructureSubTab } from '@/types/org-structure';

export const ORG_STRUCTURE_CACHE_NAMESPACE = 'org-structure';
export const ORG_STRUCTURE_CHROME_ID = 'org-structure';

/** resetKey for org infinite list: tab + debounced search. */
export function orgStructureListResetKey(
  tab: OrgStructureSubTab,
  listQuery: string
): string {
  return `${tab}::${listQuery}`;
}

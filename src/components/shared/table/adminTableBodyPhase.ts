/**
 * Admin table body phase (rule 80 / 83 soft refresh):
 * - rows: keep previous/current rows visible
 * - busy: first load — keep table chrome; body uses KvTableBusy (row skeletons)
 * - empty: idle and no rows — KvTableEmpty + empty state
 */
export type AdminTableBodyPhase = 'busy' | 'empty' | 'rows';

export function getAdminTableBodyPhase(
  isLoading: boolean,
  itemCount: number
): AdminTableBodyPhase {
  if (itemCount > 0) return 'rows';
  if (isLoading) return 'busy';
  return 'empty';
}

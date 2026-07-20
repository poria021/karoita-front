/**
 * Admin table body phases (rule 80):
 * - rows: keep previous / show data (even while soft-refresh busy)
 * - busy: first load — keep table chrome; body uses KvTableBusy
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

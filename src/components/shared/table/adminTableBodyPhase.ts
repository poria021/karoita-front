/**
 * فاز بدنهٔ جدول ادمین (رفرش نرم):
 * - `rows`: ردیف قبلی/جاری بماند
 * - `busy`: بار اول — کروم جدول بماند؛ بدنه `KvTableBusy` (اسپینر)
 * - `empty`: بیکار و بدون ردیف — `KvTableEmpty`
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

import { throwRealModeNotImplemented } from '@/lib/api-mode';
import type { Bulletin, UpsertBulletinInput } from '@/types/bulletins';

/**
 * اطلاعیه/تبلیغ هنوز endpoint در Nest ندارد — fail-closed.
 * وقتی API رسید فقط همین فایل عوض شود؛ شکل Facade ثابت می‌ماند.
 */

export async function listRealDashboardBulletins(): Promise<Bulletin[]> {
  throwRealModeNotImplemented('BulletinsService.listDashboardBulletins');
}

export async function listRealManagedBulletins(): Promise<Bulletin[]> {
  throwRealModeNotImplemented('BulletinsService.listManagedBulletins');
}

export async function createRealBulletin(
  input: UpsertBulletinInput
): Promise<Bulletin> {
  void input;
  throwRealModeNotImplemented('BulletinsService.createBulletin');
}

export async function updateRealBulletin(
  id: string,
  input: UpsertBulletinInput
): Promise<Bulletin> {
  void id;
  void input;
  throwRealModeNotImplemented('BulletinsService.updateBulletin');
}

export async function deleteRealBulletin(id: string): Promise<void> {
  void id;
  throwRealModeNotImplemented('BulletinsService.deleteBulletin');
}

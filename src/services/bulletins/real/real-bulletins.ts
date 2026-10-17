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

export async function setRealBulletinActive(
  id: string,
  isActive: boolean
): Promise<Bulletin> {
  void id;
  void isActive;
  throwRealModeNotImplemented('BulletinsService.setBulletinActive');
}

export async function deleteRealBulletin(id: string): Promise<void> {
  void id;
  throwRealModeNotImplemented('BulletinsService.deleteBulletin');
}

/** عنوان استان‌ها برای انتخاب مخاطب — از کاتالوگ ادمین Nest که همین حالا لایو است. */
export async function listRealProvinceTitles(): Promise<string[]> {
  const { adminCatalogApi } = await import(
    '@/services/admin-catalog/admin-catalog.api'
  );
  const provinces = await adminCatalogApi.getAllProvinces();
  return [...new Set(provinces.map((province) => province.title))];
}

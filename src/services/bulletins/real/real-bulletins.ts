/**
 * اطلاعیه/تبلیغ روی Nest واقعی.
 * `type=info` = اطلاعیه، `type=ads` = تبلیغ؛ هر دو زیر `/admin/advertisements` و نمایش زیر `/v1/advertisements`.
 * UI فقط `BulletinsService` را صدا می‌زند؛ تغییر قرارداد Nest فقط همین پوشه را لمس کند.
 */
import { sortBulletins } from '@/services/bulletins/bulletin-rules';
import {
  DASHBOARD_AD_PLACEMENT,
  mapAdminAdvertisement,
  mapPublicAdvertisement,
  resolveImageFileId,
  toCreateBody,
  toUpdateBody,
} from '@/services/bulletins/real/advertisement-mappers';
import { advertisementsApi } from '@/services/bulletins/real/advertisements.api';
import { FilesService } from '@/services/files.service';
import type { Bulletin, UpsertBulletinInput } from '@/types/bulletins';

async function provinceMaps(): Promise<{
  titleToId: Map<string, string>;
  idToTitle: Map<string, string>;
}> {
  const { adminCatalogApi } = await import(
    '@/services/admin-catalog/admin-catalog.api'
  );
  const provinces = await adminCatalogApi.getAllProvinces();
  const titleToId = new Map<string, string>();
  const idToTitle = new Map<string, string>();
  for (const province of provinces) {
    const title = province.title?.trim();
    const id = province.id?.trim();
    if (!title || !id) continue;
    titleToId.set(title, id);
    idToTitle.set(id, title);
  }
  return { titleToId, idToTitle };
}

export async function listRealDashboardBulletins(): Promise<Bulletin[]> {
  const [ads, infos] = await Promise.all([
    advertisementsApi.listVisible({
      type: 'ads',
      placement: DASHBOARD_AD_PLACEMENT,
    }),
    advertisementsApi.listVisible({
      type: 'info',
      placement: DASHBOARD_AD_PLACEMENT,
    }),
  ]);
  return sortBulletins([
    ...ads.map((row) => mapPublicAdvertisement(row)),
    ...infos.map((row) => mapPublicAdvertisement(row)),
  ]);
}

export async function listRealManagedBulletins(): Promise<Bulletin[]> {
  const [{ idToTitle }, rows] = await Promise.all([
    provinceMaps(),
    advertisementsApi.listManaged(),
  ]);
  return sortBulletins(rows.map((row) => mapAdminAdvertisement(row, idToTitle)));
}

export async function createRealBulletin(
  input: UpsertBulletinInput
): Promise<Bulletin> {
  const { titleToId, idToTitle } = await provinceMaps();
  const imageId = await resolveImageFileId(input, (file) =>
    FilesService.uploadFile(file)
  );
  const body = toCreateBody(input, {
    provinceTitleToId: titleToId,
    imageId,
  });
  const row = await advertisementsApi.create(body);
  return mapAdminAdvertisement(row, idToTitle);
}

export async function updateRealBulletin(
  id: string,
  input: UpsertBulletinInput
): Promise<Bulletin> {
  const { titleToId, idToTitle } = await provinceMaps();
  const existing = await advertisementsApi.getOne(id);
  const imageId = await resolveImageFileId(input, (file) =>
    FilesService.uploadFile(file)
  );
  const body = toUpdateBody(input, {
    provinceTitleToId: titleToId,
    imageId,
    existingFormat: existing.format,
  });
  const row = await advertisementsApi.update(id, body);
  return mapAdminAdvertisement(row, idToTitle);
}

export async function setRealBulletinActive(
  id: string,
  isActive: boolean
): Promise<Bulletin> {
  const [{ idToTitle }, row] = await Promise.all([
    provinceMaps(),
    advertisementsApi.setActive(id, { isActive }),
  ]);
  return mapAdminAdvertisement(row, idToTitle);
}

export async function deleteRealBulletin(id: string): Promise<void> {
  await advertisementsApi.remove(id);
}

export async function recordRealAdvertisementClick(id: string): Promise<void> {
  await advertisementsApi.recordClick(id);
}

/** عنوان استان‌ها برای انتخاب مخاطب — از کاتالوگ ادمین Nest. */
export async function listRealProvinceTitles(): Promise<string[]> {
  const { titleToId } = await provinceMaps();
  return [...titleToId.keys()].sort((a, b) => a.localeCompare(b, 'fa'));
}

/**
 * اطلاعیه/تبلیغ روی Nest واقعی.
 * `type=info` = اطلاعیه، `type=ads` = تبلیغ؛ هر دو زیر `/admin/advertisements` و نمایش زیر `/v1/advertisements`.
 * UI فقط `BulletinsService` را صدا می‌زند؛ تغییر قرارداد Nest فقط همین پوشه را لمس کند.
 */
import {
  isBulletinOwnedBy,
  sortBulletins,
  validateBulletinInput,
} from '@/services/bulletins/bulletin-rules';
import { sharedRead } from '@/lib/shared-read';
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
import { useUserStore } from '@/store/useUserStore';
import type { Bulletin, UpsertBulletinInput } from '@/types/bulletins';
import type {
  NestAdvertisementType,
  NestPublicAdvertisementDto,
} from '@/types/nest-advertisements';

const VISIBLE_ADS_SHARED_PREFIX = 'advertisements:visible:';

function emptyProvinceMaps(): {
  titleToId: Map<string, string>;
  idToTitle: Map<string, string>;
} {
  return { titleToId: new Map(), idToTitle: new Map() };
}

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

/** پنل غیرستادی استان انتخاب نمی‌کند؛ کاتالوگ ادمین را لازم ندارد و ممکن است به آن دسترسی هم نداشته باشد. */
async function provinceMapsIfNeeded(
  provinceTitles: readonly string[]
): Promise<{
  titleToId: Map<string, string>;
  idToTitle: Map<string, string>;
}> {
  const needsCatalog = provinceTitles.some((title) => title.trim());
  if (!needsCatalog) return emptyProvinceMaps();
  return provinceMaps();
}

/** لیست/فعال‌سازی: بدون کاتالوگ هم id خام نشان داده می‌شود؛ خطا کل صفحه را نبیند. */
async function provinceMapsBestEffort(): Promise<{
  titleToId: Map<string, string>;
  idToTitle: Map<string, string>;
}> {
  try {
    return await provinceMaps();
  } catch {
    return emptyProvinceMaps();
  }
}

/**
 * یک type → یک GET با placement=sidebar.
 * قبلاً برای هر type هر دو placement زده می‌شد (۴ درخواست)؛ UI داشبورد placement را
 * جدا فیلتر نمی‌کند و ساخت پیش‌فرض هم sidebar است.
 * اگر Nest بدون placement همهٔ جای‌گذاری‌ها را بدهد، همان یک GET کافی است.
 */
async function listVisibleDeduped(
  type: NestAdvertisementType
): Promise<NestPublicAdvertisementDto[]> {
  return sharedRead(`${VISIBLE_ADS_SHARED_PREFIX}${type}`, () =>
    advertisementsApi.listVisible({ type, placement: DASHBOARD_AD_PLACEMENT })
  );
}

export async function listRealDashboardBulletins(): Promise<Bulletin[]> {
  const role = useUserStore.getState().activeUser?.role;
  // مدیر ارشد مخاطب اطلاعیه نیست؛ روی میز کار همهٔ اطلاعیه‌های فعال ادمین را می‌بیند.
  if (role === 'super_admin') {
    const [{ idToTitle }, rows] = await Promise.all([
      provinceMapsBestEffort(),
      advertisementsApi.listManaged(),
    ]);
    return sortBulletins(
      rows
        .map((row) => mapAdminAdvertisement(row, idToTitle))
        .filter((row) => row.kind === 'announcement' && row.isActive !== false)
    );
  }

  const [ads, infos] = await Promise.all([
    listVisibleDeduped('ads'),
    listVisibleDeduped('info'),
  ]);
  // ترتیب پاسخ Nest را نگه می‌داریم؛ sort روی stamp ساختگی public معنی ندارد.
  return [
    ...ads.map((row) => mapPublicAdvertisement(row)),
    ...infos.map((row) => mapPublicAdvertisement(row)),
  ];
}

export async function listRealManagedBulletins(): Promise<Bulletin[]> {
  const role = useUserStore.getState().activeUser?.role;
  const [{ idToTitle }, rows] = await Promise.all([
    provinceMapsBestEffort(),
    advertisementsApi.listManaged(),
  ]);
  const mapped = rows.map((row) => mapAdminAdvertisement(row, idToTitle));
  // اگر Nest همه را برگرداند، همان قاعدهٔ mock (مالکیت پنل) را اعمال می‌کنیم.
  const owned = role
    ? mapped.filter((row) => isBulletinOwnedBy(row, role))
    : mapped;
  return sortBulletins(owned);
}

export async function createRealBulletin(
  input: UpsertBulletinInput
): Promise<Bulletin> {
  const role = useUserStore.getState().activeUser?.role;
  if (!role) throw new Error('نشست کاربری یافت نشد.');
  const validationError = validateBulletinInput(input, role);
  if (validationError) throw new Error(validationError);

  const { titleToId, idToTitle } = await provinceMapsIfNeeded(input.provinces);
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
  const role = useUserStore.getState().activeUser?.role;
  const { titleToId, idToTitle } = await provinceMapsIfNeeded(input.provinces);
  const existingDto = await advertisementsApi.getOne(id);
  const existing = mapAdminAdvertisement(existingDto, idToTitle);
  if (role && !isBulletinOwnedBy(existing, role)) {
    throw new Error('مورد موردنظر یافت نشد یا متعلق به پنل شما نیست.');
  }
  if (existing.kind !== input.kind) {
    throw new Error('نوع مورد (اطلاعیه/تبلیغ) قابل تغییر نیست.');
  }
  // سلسله‌مراتب مخاطب با نقش نویسندهٔ اصلی، نه لزوماً ویرایشگر جاری.
  const validationError = validateBulletinInput(input, existing.authorRole);
  if (validationError) throw new Error(validationError);

  const imageId = await resolveImageFileId(input, (file) =>
    FilesService.uploadFile(file)
  );
  const body = toUpdateBody(input, {
    provinceTitleToId: titleToId,
    imageId,
    existingFormat: existingDto.format,
  });
  const row = await advertisementsApi.update(id, body);
  return mapAdminAdvertisement(row, idToTitle);
}

export async function setRealBulletinActive(
  id: string,
  isActive: boolean
): Promise<Bulletin> {
  const [{ idToTitle }, row] = await Promise.all([
    provinceMapsBestEffort(),
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

/**
 * صفحهٔ اطلاعیه‌ها فقط اطلاعیه (`type=info`) نشان می‌دهد؛ تبلیغ (`type=ads`) را
 * نمی‌خوانیم تا درخواست اضافه به Nest نرود.
 */
export async function listRealReceivedAnnouncements(): Promise<Bulletin[]> {
  const role = useUserStore.getState().activeUser?.role;
  // مدیر ارشد از مسیر ادمین می‌خواند و همان‌جا فقط اطلاعیه‌ها فیلتر می‌شود.
  if (role === 'super_admin') return listRealDashboardBulletins();
  const infos = await listVisibleDeduped('info');
  return infos.map((row) => mapPublicAdvertisement(row));
}

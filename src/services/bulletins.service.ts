import { IS_MOCK_MODE } from '@/lib/api-mode';
import {
  buildBulletin,
  isBulletinOwnedBy,
  isBulletinVisibleTo,
  sortBulletins,
  validateBulletinInput,
} from '@/services/bulletins/bulletin-rules';
import {
  mockSessionAuthor,
  mockSessionProvinces,
  mutateMockBulletins,
  readMockBulletins,
} from '@/services/bulletins/mock/mock-bulletins-store';
import {
  createRealBulletin,
  deleteRealBulletin,
  listRealDashboardBulletins,
  listRealManagedBulletins,
  listRealProvinceTitles,
  recordRealAdvertisementClick,
  setRealBulletinActive,
  updateRealBulletin,
} from '@/services/bulletins/real/real-bulletins';
import { OrgStructureService } from '@/services/org-structure.service';
import type { Bulletin, UpsertBulletinInput } from '@/types/bulletins';
import { fileToDataUrl } from '@/utils/compressor';

function findOwnedOrThrow(rows: Bulletin[], id: string): Bulletin {
  const author = mockSessionAuthor();
  const row = rows.find((item) => item.id === id);
  if (!row || !isBulletinOwnedBy(row, author.role)) {
    throw new Error('مورد موردنظر یافت نشد یا متعلق به پنل شما نیست.');
  }
  return row;
}

/** در mock فایل را به data URL تبدیل می‌کنیم؛ real خودش FilesService را صدا می‌زند. */
async function resolveMockImage(
  input: UpsertBulletinInput
): Promise<UpsertBulletinInput> {
  if (!input.imageFile) return input;
  const imageUrl = await fileToDataUrl(input.imageFile);
  return {
    kind: input.kind,
    title: input.title,
    body: input.body,
    audienceRoles: input.audienceRoles,
    provinces: input.provinces,
    ...(input.linkUrl ? { linkUrl: input.linkUrl } : {}),
    imageUrl,
  };
}

/**
 * اطلاعیه‌ها و تبلیغات. UI فقط همین Facade را صدا می‌زند.
 * real → Nest `Advertisements` / `Admin advertisements` با `type=ads|info`.
 */
export const BulletinsService = {
  /** موارد فعال و قابل نمایش در داشبورد کاربر جاری (نقش + استان). */
  async listDashboardBulletins(): Promise<Bulletin[]> {
    if (!IS_MOCK_MODE) return listRealDashboardBulletins();
    const { role } = mockSessionAuthor();
    const provinces = mockSessionProvinces();
    return sortBulletins(
      readMockBulletins().filter((row) =>
        isBulletinVisibleTo(row, role, provinces)
      )
    );
  },

  /** موارد منتشرشدهٔ پنل جاری (فعال و غیرفعال) برای صفحهٔ مدیریت. */
  async listManagedBulletins(): Promise<Bulletin[]> {
    if (!IS_MOCK_MODE) return listRealManagedBulletins();
    const { role } = mockSessionAuthor();
    return sortBulletins(
      readMockBulletins().filter((row) => isBulletinOwnedBy(row, role))
    );
  },

  /** عنوان همهٔ استان‌ها برای انتخاب مخاطب در فرم. */
  async listProvinceOptions(): Promise<string[]> {
    if (!IS_MOCK_MODE) return listRealProvinceTitles();
    return OrgStructureService.listLabelsForField('province');
  },

  async createBulletin(input: UpsertBulletinInput): Promise<Bulletin> {
    if (!IS_MOCK_MODE) return createRealBulletin(input);
    const author = mockSessionAuthor();
    const resolved = await resolveMockImage(input);
    const error = validateBulletinInput(resolved, author.role);
    if (error) throw new Error(error);
    const created = buildBulletin(resolved, author);
    mutateMockBulletins((draft) => {
      draft.push(created);
    });
    return created;
  },

  async updateBulletin(
    id: string,
    input: UpsertBulletinInput
  ): Promise<Bulletin> {
    if (!IS_MOCK_MODE) return updateRealBulletin(id, input);
    const author = mockSessionAuthor();
    const rows = readMockBulletins();
    const existing = findOwnedOrThrow(rows, id);
    if (existing.kind !== input.kind) {
      throw new Error('نوع مورد (اطلاعیه/تبلیغ) قابل تغییر نیست.');
    }
    const resolved = await resolveMockImage(input);
    // اعتبارسنجی با نقش منتشرکنندهٔ اصلی تا مخاطب از سلسله‌مراتب او بیرون نرود.
    const error = validateBulletinInput(resolved, existing.authorRole);
    if (error) throw new Error(error);
    const updated = buildBulletin(resolved, author, existing);
    mutateMockBulletins((draft) =>
      draft.map((row) => (row.id === id ? updated : row))
    );
    return updated;
  },

  /** فعال/غیرفعال‌سازی؛ مورد غیرفعال حذف نمی‌شود و فقط از میز کار مخاطبان پنهان می‌ماند. */
  async setBulletinActive(id: string, isActive: boolean): Promise<Bulletin> {
    if (!IS_MOCK_MODE) return setRealBulletinActive(id, isActive);
    findOwnedOrThrow(readMockBulletins(), id);
    let updated: Bulletin | undefined;
    mutateMockBulletins((draft) =>
      draft.map((row) => {
        if (row.id !== id) return row;
        updated = { ...row, isActive, updatedAt: new Date().toISOString() };
        return updated;
      })
    );
    if (!updated) throw new Error('مورد موردنظر یافت نشد.');
    return updated;
  },

  async deleteBulletin(id: string): Promise<void> {
    if (!IS_MOCK_MODE) return deleteRealBulletin(id);
    findOwnedOrThrow(readMockBulletins(), id);
    mutateMockBulletins((draft) => draft.filter((row) => row.id !== id));
  },

  /**
   * ثبت کلیک روی تبلیغ (فقط real معنی دارد).
   * خطا را می‌بلعد تا باز شدن لینک کاربر را متوقف نکند.
   */
  async recordAdvertisementClick(id: string): Promise<void> {
    if (IS_MOCK_MODE) return;
    try {
      await recordRealAdvertisementClick(id);
    } catch {
      // آمار کلیک نباید UX لینک را خراب کند.
    }
  },
};

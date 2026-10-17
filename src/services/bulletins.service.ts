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
  setRealBulletinActive,
  updateRealBulletin,
} from '@/services/bulletins/real/real-bulletins';
import { OrgStructureService } from '@/services/org-structure.service';
import type { Bulletin, UpsertBulletinInput } from '@/types/bulletins';

function findOwnedOrThrow(rows: Bulletin[], id: string): Bulletin {
  const author = mockSessionAuthor();
  const row = rows.find((item) => item.id === id);
  if (!row || !isBulletinOwnedBy(row, author.role)) {
    throw new Error('مورد موردنظر یافت نشد یا متعلق به پنل شما نیست.');
  }
  return row;
}

/**
 * اطلاعیه‌ها و تبلیغات. UI فقط همین Facade را صدا می‌زند.
 * فعلاً فقط mock؛ real تا آمدن endpoint در Nest fail-closed است.
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
    const error = validateBulletinInput(input, author.role);
    if (error) throw new Error(error);
    const created = buildBulletin(input, author);
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
    // اعتبارسنجی با نقش منتشرکنندهٔ اصلی تا مخاطب از سلسله‌مراتب او بیرون نرود.
    const error = validateBulletinInput(input, existing.authorRole);
    if (error) throw new Error(error);
    const updated = buildBulletin(input, author, existing);
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
};

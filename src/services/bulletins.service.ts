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
  mutateMockBulletins,
  readMockBulletins,
} from '@/services/bulletins/mock/mock-bulletins-store';
import {
  createRealBulletin,
  deleteRealBulletin,
  listRealDashboardBulletins,
  listRealManagedBulletins,
  updateRealBulletin,
} from '@/services/bulletins/real/real-bulletins';
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
  /** موارد قابل نمایش در داشبورد کاربر جاری (اطلاعیهٔ بالادست + تبلیغ ستاد). */
  async listDashboardBulletins(): Promise<Bulletin[]> {
    if (!IS_MOCK_MODE) return listRealDashboardBulletins();
    const { role } = mockSessionAuthor();
    return sortBulletins(
      readMockBulletins().filter((row) => isBulletinVisibleTo(row, role))
    );
  },

  /** موارد منتشرشدهٔ پنل جاری برای صفحهٔ مدیریت. */
  async listManagedBulletins(): Promise<Bulletin[]> {
    if (!IS_MOCK_MODE) return listRealManagedBulletins();
    const { role } = mockSessionAuthor();
    return sortBulletins(
      readMockBulletins().filter((row) => isBulletinOwnedBy(row, role))
    );
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

  async deleteBulletin(id: string): Promise<void> {
    if (!IS_MOCK_MODE) return deleteRealBulletin(id);
    findOwnedOrThrow(readMockBulletins(), id);
    mutateMockBulletins((draft) => draft.filter((row) => row.id !== id));
  },
};

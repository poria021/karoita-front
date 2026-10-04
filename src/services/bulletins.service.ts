import { IS_MOCK_MODE } from '@/lib/api-mode';
import { buildBulletin } from '@/services/bulletins/bulletin-rules';
import {
  MOCK_BULLETIN_AUTHOR,
  mockBulletins,
} from '@/services/bulletins/mock/bulletins.fixtures';
import {
  createRealBulletin,
  deleteRealBulletin,
  listRealDashboardBulletins,
  listRealManagedBulletins,
  updateRealBulletin,
} from '@/services/bulletins/real/real-bulletins';
import type { Bulletin, UpsertBulletinInput } from '@/types/bulletins';

/**
 * اطلاعیه‌ها و تبلیغات. UI فقط همین Facade را صدا می‌زند.
 * mock: فقط داده‌ی ثابت؛ نوشتن‌ها چیزی ذخیره نمی‌کنند.
 */
export const BulletinsService = {
  /** موارد قابل نمایش در داشبورد کاربر جاری (اطلاعیهٔ بالادست + تبلیغ ستاد). */
  async listDashboardBulletins(): Promise<Bulletin[]> {
    if (!IS_MOCK_MODE) return listRealDashboardBulletins();
    return mockBulletins();
  },

  /** موارد منتشرشدهٔ پنل جاری برای صفحهٔ مدیریت. */
  async listManagedBulletins(): Promise<Bulletin[]> {
    if (!IS_MOCK_MODE) return listRealManagedBulletins();
    return mockBulletins();
  },

  async createBulletin(input: UpsertBulletinInput): Promise<Bulletin> {
    if (!IS_MOCK_MODE) return createRealBulletin(input);
    return buildBulletin(input, MOCK_BULLETIN_AUTHOR);
  },

  async updateBulletin(
    id: string,
    input: UpsertBulletinInput
  ): Promise<Bulletin> {
    if (!IS_MOCK_MODE) return updateRealBulletin(id, input);
    return { ...buildBulletin(input, MOCK_BULLETIN_AUTHOR), id };
  },

  async deleteBulletin(id: string): Promise<void> {
    if (!IS_MOCK_MODE) return deleteRealBulletin(id);
  },
};

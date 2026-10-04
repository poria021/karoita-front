import { IS_MOCK_MODE } from '@/lib/api-mode';
import { mockSyllabusSnapshot } from '@/services/syllabus-config/mock/syllabus.fixtures';
import {
  setRealPassingThreshold,
  setRealProfessorCapacity,
} from '@/services/syllabus-config/real/real-syllabus-mutations';
import type { SyllabusConfigSnapshot } from '@/types/syllabus-config';

/** mock: نوشتن‌ها چیزی ذخیره نمی‌کنند و همان snapshot ثابت را برمی‌گردانند. */
export const settingsMutations = {
  /** `POST /admin/settings` — Nest برای تنظیمات PATCH ندارد؛ هر نوشته ردیف جدید است. */
  async setProfessorCapacity(
    capacity: number
  ): Promise<SyllabusConfigSnapshot> {
    if (!IS_MOCK_MODE) return setRealProfessorCapacity(capacity);
    return mockSyllabusSnapshot();
  },

  /** `POST /admin/settings` — هر نوشته ردیف جدید می‌سازد. */
  async setPassingThreshold(
    threshold: number
  ): Promise<SyllabusConfigSnapshot> {
    if (!IS_MOCK_MODE) return setRealPassingThreshold(threshold);
    return mockSyllabusSnapshot();
  },
};

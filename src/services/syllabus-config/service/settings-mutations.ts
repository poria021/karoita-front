import { IS_MOCK_MODE } from '@/lib/api-mode';
import { mutateSyllabusSnapshot } from '@/services/syllabus-config/mock/mock-syllabus-store';
import {
  setRealPassingThreshold,
  setRealProfessorCapacity,
} from '@/services/syllabus-config/real/real-syllabus-mutations';
import type { SyllabusConfigSnapshot } from '@/types/syllabus-config';

import { gateSyllabusTermSettings } from './gates';

export const settingsMutations = {
  /** `POST /admin/settings` — Nest برای تنظیمات PATCH ندارد؛ هر نوشته ردیف جدید است. */
  async setProfessorCapacity(
    capacity: number
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabusTermSettings();
    if (!IS_MOCK_MODE) {
      return setRealProfessorCapacity(capacity);
    }
    return mutateSyllabusSnapshot((draft) => {
      draft.globalProfessorCapacity = capacity;
    });
  },

  /** `POST /admin/settings` — هر نوشته ردیف جدید می‌سازد. */
  async setPassingThreshold(
    threshold: number
  ): Promise<SyllabusConfigSnapshot> {
    gateSyllabusTermSettings();
    if (!IS_MOCK_MODE) {
      return setRealPassingThreshold(threshold);
    }
    return mutateSyllabusSnapshot((draft) => {
      draft.passingScoreThreshold = threshold;
    });
  },
};

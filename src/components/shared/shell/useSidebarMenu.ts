'use client';

import { useMemo, useSyncExternalStore } from 'react';

import {
  getShallowLocationSearch,
  getShallowLocationSearchServerSnapshot,
  subscribeShallowLocation,
} from '@/lib/shallow-location';
import { SyllabusConfigService } from '@/services/syllabus-config.service';
import type { UserRole } from '@/types/auth';
import { getVisibleSidebarMenu } from '@/utils/RoleStrategyMap';
import { withEnrollmentSubModules } from '@/utils/role-strategy/enrollment-menu';
import { withEvaluationSubModules } from '@/utils/role-strategy/evaluation-menu';

/** query فعلی (بدون ناوبری Next) تا لینک‌های دارای `?kind=&course=` درست فعال شوند. */
export function useSidebarSearch(): string {
  return useSyncExternalStore(
    subscribeShallowLocation,
    getShallowLocationSearch,
    getShallowLocationSearchServerSnapshot
  );
}

/**
 * منوی قابل‌نمایش نقش با درس‌های فعال مدیر ارشد:
 * - ارزیابی گزارش‌های فراگیران (استاد/معلم/مدیر مدرسه): هر درس یک ساب‌تایتل.
 * - انتخاب واحد (دانشجو ← ترمی، مهارت‌آموز ← پودمانی): هر درس یک عنوان با زیرمجموعه‌هایش.
 * منوی ایستا دست‌نخورده می‌ماند (عنوان صفحه/بردکرامب از آن است).
 */
export function useSidebarMenu(role: UserRole | string | null | undefined) {
  return useMemo(() => {
    const visible = getVisibleSidebarMenu(role);
    const evaluated = withEvaluationSubModules(visible, {
      semester: SyllabusConfigService.getActiveCourseDefinitions('semester'),
      modular: SyllabusConfigService.getActiveCourseDefinitions('modular'),
    });
    if (role === 'student') {
      return withEnrollmentSubModules(
        evaluated,
        SyllabusConfigService.getActiveCourseDefinitions('semester')
      );
    }
    if (role === 'skill_learner') {
      return withEnrollmentSubModules(
        evaluated,
        SyllabusConfigService.getActiveCourseDefinitions('modular')
      );
    }
    return evaluated;
  }, [role]);
}

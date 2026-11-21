'use client';

import { useSyncExternalStore } from 'react';

import { useActiveCourseDefinitions } from '@/hooks/useActiveCourseDefinitions';
import {
  getShallowLocationSearch,
  getShallowLocationSearchServerSnapshot,
  subscribeShallowLocation,
} from '@/lib/shallow-location';
import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import { EVALUATION_MODULE_PARAM } from '@/utils/role-strategy/evaluation-menu';

import { DAILY_APPROVALS_CHROME_ID } from '../lib/dailyApprovalsListKeys';

/**
 * نام درسِ انتخاب‌شدهٔ ماژول ارزیابی برای کنار عنوان صفحه (فقط خواندنی).
 * منطق انتخاب همان `useDailyApprovalModule` است: `?module=` یا اولین درس فعال.
 */
export function useDailyApprovalsHeaderCourse(enabled: boolean): string | null {
  const search = useSyncExternalStore(
    subscribeShallowLocation,
    getShallowLocationSearch,
    getShallowLocationSearchServerSnapshot
  );
  const getChrome = useDashboardModuleCache((state) => state.getChrome);
  const definitions = useActiveCourseDefinitions();
  if (!enabled) return null;

  const params = new URLSearchParams(search);
  const cachedKind = getChrome<{ kind?: string }>(
    DAILY_APPROVALS_CHROME_ID
  )?.kind;
  const rawKind = params.get('kind') ?? cachedKind;
  const kind = rawKind === 'apprenticeship' ? 'apprenticeship' : 'internship';
  const all =
    kind === 'internship' ? definitions.semester : definitions.modular;
  const courses = all.filter((course) => course.isActive);
  const raw = params.get(EVALUATION_MODULE_PARAM);
  return (
    (courses.find((course) => course.id === raw) ?? courses[0])?.title ?? null
  );
}

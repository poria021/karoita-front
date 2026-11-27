import { expect, type Page } from '@playwright/test';

import {
  AUTH_MOCK_USERS,
  MOCK_USER_PASSWORD,
} from '../../src/services/auth/mock/auth-mock-users';
import { RouteService } from '../../src/services/route.service';

export type LearnerRole = 'student' | 'skill_learner';

export const LEARNER_ROLES: readonly LearnerRole[] = [
  'student',
  'skill_learner',
];

/** کاربر mock تأییدشده (مدارک و حساب) برای نقش فراگیر. */
export function approvedMockUser(role: LearnerRole): { mobile: string } {
  const user = AUTH_MOCK_USERS.find(
    (candidate) =>
      candidate.role === role &&
      candidate.approved &&
      candidate.docStatus === 'approved'
  );
  if (!user?.mobile) throw new Error(`no approved mock user for ${role}`);
  return { mobile: user.mobile };
}

/** ورود با رمز عبور (کاربر `MOCK_*`) تا رسیدن به یکی از صفحه‌های `/karvita/`. */
export async function loginWithPassword(
  page: Page,
  mobile: string
): Promise<void> {
  await page.goto(RouteService.auth.login());
  const loginTab = page.getByRole('tab', { name: /ورود/ });
  if (await loginTab.count()) await loginTab.click();

  const mobileInput = page.locator('#login-mobile');
  await expect(mobileInput).toBeVisible({ timeout: 30_000 });
  await mobileInput.click();
  await mobileInput.fill('');
  await mobileInput.pressSequentially(mobile, { delay: 15 });
  await page.locator('#login-password').fill(MOCK_USER_PASSWORD);
  await page.getByRole('button', { name: /ورود به سامانه/ }).click();
  await page.waitForURL(/\/karvita\//, { timeout: 40_000 });
}

/**
 * آدرس همهٔ درخواست‌های مرورگر به پروکسی Nest (`/api/nest/`). در حالت mock نباید
 * هیچ‌کدام زده شود: بک‌اند واقعی نشست mock را نمی‌شناسد و با ۴۰۱ کاربر را به لاگین
 * برمی‌گرداند.
 */
export function trackNestRequests(page: Page): string[] {
  const urls: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/nest/')) urls.push(request.url());
  });
  return urls;
}

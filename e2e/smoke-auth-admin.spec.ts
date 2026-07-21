import { expect, test, type Page } from '@playwright/test';

import {
  MOCK_OTP_CODE,
  MOCK_SUPER_ADMIN_MOBILE,
} from '../src/services/mock/auth-mock-users';
import { RouteService } from '../src/services/route.service';

/**
 * Smoke: marketing → public login shell → admin-gate OTP → org-structure.
 * Super-admin is blocked on public `/auth/login` (by design); use admin-gate.
 * OTP/mobile come from the shared mock seed — no invented secrets.
 */
async function fillMobile(page: Page, selector: string, mobile: string) {
  await page.locator(selector).click();
  await page.locator(selector).fill('');
  await page.locator(selector).pressSequentially(mobile, { delay: 15 });
}

async function loginAsMockSuperAdminViaGate(page: Page): Promise<void> {
  await page.goto(RouteService.auth.adminGate());
  await expect(page.locator('#admin-gate-mobile')).toBeVisible({
    timeout: 30_000,
  });

  await fillMobile(page, '#admin-gate-mobile', MOCK_SUPER_ADMIN_MOBILE);
  await page.getByRole('button', { name: /ارسال کد تایید/ }).click();

  await expect(page.locator('#admin-gate-otp')).toBeVisible({
    timeout: 15_000,
  });
  await page.locator('#admin-gate-otp').click();
  await page.locator('#admin-gate-otp').pressSequentially(MOCK_OTP_CODE, {
    delay: 15,
  });
  await page.getByRole('button', { name: 'ورود به پنل مدیریت' }).click();

  await expect(page).toHaveURL(
    new RegExp(`${RouteService.karvita.adminDashboard().replace(/\//g, '\\/')}\\/?$`),
    { timeout: 30_000 }
  );
  await expect(
    page.getByRole('heading', { name: /پنل کاربری - مدیر ارشد/ })
  ).toBeVisible();
}

test.describe('mock smoke', () => {
  test('marketing exposes public login shell', async ({ page }) => {
    await page.goto(RouteService.marketing.home());
    await expect(
      page.getByRole('heading', { name: 'کارویتا' })
    ).toBeVisible();
    await page.getByRole('link', { name: /ورود به میز کار/ }).click();
    await expect(page).toHaveURL(
      new RegExp(`${RouteService.auth.login().replace(/\//g, '\\/')}\\/?$`)
    );

    const loginTab = page.getByRole('tab', { name: /ورود/ });
    if (await loginTab.count()) {
      await loginTab.click();
    }
    await expect(page.locator('#login-mobile')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole('button', { name: 'ورود به سامانه' })
    ).toBeVisible();
  });

  test('admin-gate OTP reaches org-structure table', async ({ page }) => {
    await loginAsMockSuperAdminViaGate(page);

    await page.goto(RouteService.karvita.organizationalStructure());
    await expect(page).not.toHaveURL(/404|not-found/i);

    await expect(
      page.getByRole('heading', { name: /مدیریت ساختار/ })
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole('tablist', { name: 'تقسیمات ساختاری' })
    ).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('نام استان').first()).toBeVisible();
  });

  test('admin-gate session can open user-creation and onboarding', async ({
    page,
  }) => {
    await loginAsMockSuperAdminViaGate(page);

    await page.goto(RouteService.karvita.adminUserCreation());
    await expect(page).not.toHaveURL(/404|not-found/i);
    await expect(
      page.getByRole('heading', { name: /ایجاد حساب کاربری جدید/ })
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole('button', { name: /ثبت و ایجاد حساب کاربری/ })
    ).toBeVisible();

    await page.goto(RouteService.karvita.onboardingApprovals());
    await expect(page).not.toHaveURL(/404|not-found/i);
    await expect(
      page.getByRole('heading', { name: /بررسی مدارک هویتی/ })
    ).toBeVisible({ timeout: 30_000 });
  });
});

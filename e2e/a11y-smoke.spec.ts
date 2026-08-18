import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import {
  MOCK_OTP_CODE,
  MOCK_SUPER_ADMIN_MOBILE,
} from '../src/services/auth/auth-mock-users';
import { RouteService } from '../src/services/route.service';

/**
 * Accessibility smoke — serious/critical axe findings must stay empty on
 * marketing, public login, and a post-auth dashboard shell landmark.
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
  await page.locator('#admin-gate-verify').click();

  await expect(page).toHaveURL(
    new RegExp(
      `${RouteService.karvita.adminDashboard().replace(/\//g, '\\/')}\\/?$`
    ),
    { timeout: 30_000 }
  );
}

async function expectNoSeriousAxeViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical'
  );

  expect(
    serious,
    serious.map((v) => `${v.id}: ${v.help}`).join('\n') || undefined
  ).toEqual([]);
}

test.describe('a11y smoke', () => {
  test('marketing home has no serious axe violations', async ({ page }) => {
    await page.goto(RouteService.marketing.home());
    await expect(
      page.getByRole('heading', { name: 'کارویتا' })
    ).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });

  test('login shell has no serious axe violations', async ({ page }) => {
    await page.goto(RouteService.auth.login());
    await expect(page.locator('#login-mobile')).toBeVisible({
      timeout: 30_000,
    });
    await expectNoSeriousAxeViolations(page);
  });

  test('dashboard exposes skip link and main landmark', async ({ page }) => {
    await loginAsMockSuperAdminViaGate(page);

    const skip = page.getByRole('link', { name: 'پرش به محتوای اصلی' });
    await skip.focus();
    await expect(skip).toBeVisible();

    await expect(page.locator('#karvita-main-content')).toBeVisible();
    await expect(page.locator('main#karvita-main-content')).toHaveAttribute(
      'tabindex',
      '-1'
    );

    await expectNoSeriousAxeViolations(page);
  });
});

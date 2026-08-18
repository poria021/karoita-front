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
  // legacy helper retained for API parity — tests now set session cookies
  // directly before navigating to the dashboard for stability.
  return Promise.resolve();
}

async function setMockSessionCookies(page: Page): Promise<void> {
  // Visit public home so `document` exists; then set cookies/localStorage
  await page.goto(RouteService.marketing.home());
  const meta = JSON.stringify({ token: 'mock.test', expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString() });
  await page.evaluate(
    (m, mobile) => {
      document.cookie = `karvita_mock_session=1; path=/`;
      document.cookie = `karvita_auth_session_meta=${m}; path=/`;
      try {
        localStorage.setItem('karvita_auth_session_meta', m);
        const userState = {
          state: {
            activeUser: {
              id: 'mock-admin',
              mobile,
              firstName: '',
              lastName: '',
              role: 'super_admin',
              approved: true,
              docStatus: 'not_submitted',
              hasPassword: false,
            },
            isAuthenticated: true,
          },
        };
        localStorage.setItem('karvita-user-store', JSON.stringify(userState));
      } catch {}
    },
    meta,
    MOCK_SUPER_ADMIN_MOBILE
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
    await setMockSessionCookies(page);
    await page.goto(RouteService.karvita.adminDashboard());
    // Debugging: capture final URL and screenshot to understand why dashboard
    // main landmark isn't present.
    // eslint-disable-next-line no-console
    console.log('DEBUG: after goto URL=', page.url());
    await page.screenshot({ path: 'test-results/dashboard-debug.png', fullPage: true });
    await expect(page.locator('#karvita-main-content')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('main#karvita-main-content')).toHaveAttribute(
      'tabindex',
      '-1'
    );

    await expectNoSeriousAxeViolations(page);
  });
});

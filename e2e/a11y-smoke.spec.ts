import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { MOCK_SUPER_ADMIN_MOBILE } from '../src/services/auth/mock/auth-mock-users';
import { RouteService } from '../src/services/route.service';

/**
 * Accessibility smoke — serious/critical axe findings must stay empty on
 * marketing, public login, and a post-auth dashboard shell landmark.
 */

async function setMockSessionCookies(page: Page): Promise<void> {
  // Visit public home so `document` exists; then set cookies/localStorage
  await page.goto(RouteService.marketing.home());
  const meta = JSON.stringify({ token: 'mock.test', expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString() });
  // Ensure cookies are installed at the browser context so the Edge/proxy
  // middleware sees them on the subsequent navigation to the dashboard.
  try {
    await page.context().addCookies([
      { name: 'karvita_mock_session', value: '1', url: page.url(), path: '/' },
      { name: 'karvita_auth_session_meta', value: meta, url: page.url(), path: '/' },
    ]);
  } catch {
    // ignore addCookies failures — fallback to document.cookie below
  }

  await page.evaluate(
    ({ m, mobile }) => {
      document.cookie = `karvita_mock_session=1; path=/`;
      document.cookie = `karvita_auth_session_meta=${m}; path=/`;
      try {
        // useUserStore persists to sessionStorage (see src/store/useUserStore.ts) —
        // seed the same storage the app actually reads on rehydrate.
        sessionStorage.setItem('karvita_auth_session_meta', m);
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
        sessionStorage.setItem('karvita-user-store', JSON.stringify(userState));
      } catch {}
    },
    { m: meta, mobile: MOCK_SUPER_ADMIN_MOBILE }
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

    const skip = page.getByRole('link', { name: 'پرش به محتوای اصلی' });
    const main = page.locator('main#karvita-main-content');

    await expect(skip).toBeAttached({ timeout: 30_000 });
    await expect(main).toBeVisible({ timeout: 30_000 });
    await expect(main).toHaveAttribute('tabindex', '-1');

    await skip.focus();
    await expect(skip).toBeVisible();
    await skip.press('Enter');
    await expect(main).toBeFocused();

    await expectNoSeriousAxeViolations(page);
  });
});

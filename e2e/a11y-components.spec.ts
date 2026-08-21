import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { RouteService } from '../src/services/route.service';
import { MOCK_SUPER_ADMIN_MOBILE } from '../src/services/auth/auth-mock-users';

async function expectNoSeriousAxeViolations(page: Page, include?: string) {
  let builder = new AxeBuilder({ page }).withTags([
    'wcag2a',
    'wcag2aa',
    'wcag21a',
    'wcag21aa',
  ]);
  if (include) {
    builder = builder.include(include);
  }
  const results = await builder.analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical'
  );
  expect(
    serious,
    serious.map((v) => `${v.id}: ${v.help}`).join('\n') || undefined
  ).toEqual([]);
}

async function setMockAdminSession(page: Page, mobile: string): Promise<void> {
  // اول به صفحه عمومی می‌ریم تا document وجود داشته باشه
  await page.goto(RouteService.marketing.home());

  const meta = JSON.stringify({
    token: 'mock.test',
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  });

  // کوکی رو در browser context ست می‌کنیم تا middleware Edge هم ببینه
  try {
    await page.context().addCookies([
      { name: 'karvita_mock_session', value: '1', url: page.url(), path: '/' },
      { name: 'karvita_auth_session_meta', value: meta, url: page.url(), path: '/' },
    ]);
  } catch {
    // fallback به document.cookie
  }

  await page.evaluate(
    ({ m, mob }) => {
      document.cookie = `karvita_mock_session=1; path=/`;
      document.cookie = `karvita_auth_session_meta=${m}; path=/`;
      try {
        // useUserStore persists to sessionStorage (see src/store/useUserStore.ts) —
        // seed the same storage the app actually reads on rehydrate.
        sessionStorage.setItem('karvita_auth_session_meta', m);
        sessionStorage.setItem(
          'karvita-user-store',
          JSON.stringify({
            state: {
              activeUser: {
                id: 'mock-admin',
                mobile: mob,
                firstName: '',
                lastName: '',
                role: 'super_admin',
                approved: true,
                docStatus: 'not_submitted',
                hasPassword: false,
              },
              isAuthenticated: true,
            },
          })
        );
      } catch {}
    },
    { m: meta, mob: mobile }
  );
}

test.describe('a11y components', () => {
  test('login form fields are labelled', async ({ page }) => {
    await page.goto(RouteService.auth.login());
    const mobile = page.locator('#login-mobile');
    await expect(mobile).toBeVisible({ timeout: 30_000 });
    await expect(page.getByLabel('شماره موبایل')).toBeVisible();
    await expectNoSeriousAxeViolations(page, 'main');
  });

  test('skip link is the first focusable control on the app shell', async ({
    page,
  }) => {
    await setMockAdminSession(page, MOCK_SUPER_ADMIN_MOBILE);

    await page.goto(RouteService.karvita.adminDashboard());
    await expect(page.locator('main#karvita-main-content')).toBeVisible({
      timeout: 30_000,
    });

    await page.locator('body').press('Tab');
    const skip = page.getByRole('link', { name: 'پرش به محتوای اصلی' });
    await expect(skip).toBeFocused();
    await skip.press('Enter');
    await expect(page.locator('main#karvita-main-content')).toBeFocused();
  });
});

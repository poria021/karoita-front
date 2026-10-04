/**
 * تأخیر کوتاه فقط در mock تا اسپینر «۱۰ سطر بعدی» در UI دیده شود.
 * در real mode استفاده نشود.
 */
export const MOCK_ADMIN_LIST_PAGE_DELAY_MS = 280;

export function delayMockAdminListPage(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, MOCK_ADMIN_LIST_PAGE_DELAY_MS);
  });
}

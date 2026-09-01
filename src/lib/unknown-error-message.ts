/** مقدار throw ناشناس را به پیام قابل‌نمایش کاربر تبدیل می‌کند. */
export function unknownErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

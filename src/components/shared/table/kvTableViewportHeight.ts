/**
 * ارتفاع ویوپورت جدول ادمین:
 * ۱ سطر هدر + ۱۰ سطر بدنه با `h-12` (۳rem) = ۳۳rem
 * تا صفحهٔ اول (DEFAULT_PAGE_LIMIT=10) بدون اسکرول جا شود
 * و اسپینر «بارگذاری بیشتر» بلافاصله دیده نشود.
 */
export const KV_TABLE_VIEWPORT_HEIGHT = 'h-[min(33rem,60dvh)]';

export const KV_TABLE_EMPTY_FILL_HEIGHT =
  'min-h-[calc(min(33rem,60dvh)-3rem)]';

/** ارتفاع ثابت سطر هدر/بدنه در همه جدول‌های ادمین */
export const KV_TABLE_ROW_HEIGHT_CLASS = 'h-12';

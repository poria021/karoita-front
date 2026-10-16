import type { UserRole } from '@/types/auth';

/**
 * ویجت‌های میز کار. ویجت جدید = شناسه اینجا + رندرکننده در `DashboardWidgetGrid`
 * (Record کامل است؛ بدون رندرکننده tsc خطا می‌دهد) + افزودن به نقش‌های مربوط.
 */
export type DashboardWidgetId = 'bulletins';

/** پهنا در گرید سه‌ستونهٔ دسکتاپ؛ در موبایل همه تمام‌عرض‌اند. */
export type DashboardWidgetSpan = 'third' | 'two-thirds' | 'full';

export type DashboardWidget = {
  id: DashboardWidgetId;
  span: DashboardWidgetSpan;
};

/** مشترک همهٔ پنل‌ها، همیشه بالای میز کار: تبلیغ ستاد + اطلاعیه‌ها. */
const COMMON_WIDGETS: readonly DashboardWidget[] = [
  { id: 'bulletins', span: 'full' },
];

/**
 * ویجت‌های اختصاصی هر پنل بر اساس فیچرهای خودش — مثلاً نمودار گزارش‌ها،
 * پیشرفت تحصیلی دانشجو/مهارت‌آموز، اطلاعات ترم. فعلاً هیچ پنلی ویجت اختصاصی ندارد.
 */
const ROLE_WIDGETS: Partial<Record<UserRole, readonly DashboardWidget[]>> = {};

export function getDashboardWidgets(role: UserRole): DashboardWidget[] {
  return [...COMMON_WIDGETS, ...(ROLE_WIDGETS[role] ?? [])];
}

import type { UserRole } from '@/types/auth';

/**
 * ویجت‌های میز کار. ویجت جدید = شناسه اینجا + رندرکننده در `DashboardWidgetGrid`
 * (Record کامل است؛ بدون رندرکننده tsc خطا می‌دهد) + افزودن به نقش‌های مربوط.
 */
export type DashboardWidgetId = 'bulletins' | 'learner_desk';

/**
 * پهنای منطقی ویجت در گرید ۱۲ستونهٔ میز کار (`@/lib/workbench-grid`).
 * رندر واقعی ستون‌ها داخل خود ویجت است (مثلاً bulletins سه سلول می‌سازد).
 */
export type DashboardWidgetSpan = 'third' | 'two-thirds' | 'full';

export type DashboardWidget = {
  id: DashboardWidgetId;
  span: DashboardWidgetSpan;
};

/** مشترک همهٔ پنل‌ها، همیشه بالای میز کار: خوش‌آمد + اطلاعیه‌ها + تبلیغ. */
const COMMON_WIDGETS: readonly DashboardWidget[] = [
  { id: 'bulletins', span: 'full' },
];

const LEARNER_DESK_WIDGET: DashboardWidget = {
  id: 'learner_desk',
  span: 'full',
};

/**
 * ویجت‌های اختصاصی هر پنل بر اساس فیچرهای خودش —
 * دانشجو/مهارت‌آموز: اقدام بعدی + دورهٔ فعال + جزوات.
 */
const ROLE_WIDGETS: Partial<Record<UserRole, readonly DashboardWidget[]>> = {
  student: [LEARNER_DESK_WIDGET],
  skill_learner: [LEARNER_DESK_WIDGET],
};

export function getDashboardWidgets(role: UserRole): DashboardWidget[] {
  return [...COMMON_WIDGETS, ...(ROLE_WIDGETS[role] ?? [])];
}

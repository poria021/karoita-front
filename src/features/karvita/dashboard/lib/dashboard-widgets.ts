import type { UserRole } from '@/types/auth';

/**
 * ویجت‌های میز کار. ویجت جدید = شناسه اینجا + رندرکننده در `DashboardWidgetGrid`
 * (Record کامل است؛ بدون رندرکننده tsc خطا می‌دهد) + افزودن به نقش‌های مربوط.
 *
 * صف پاسخ‌گویی استاد و خلاصهٔ تأیید مدارک مدیر ارشد داخل
 * `DashboardBulletinsBoard` هستند، نه ویجت جدا.
 */
export type DashboardWidgetId = 'bulletins' | 'learner_grades';

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

const LEARNER_GRADES_WIDGET: DashboardWidget = {
  id: 'learner_grades',
  span: 'full',
};

/**
 * ویجت‌های اختصاصی هر پنل —
 * دانشجو/مهارت‌آموز: روند نمرهٔ هفتگی درس‌های نیم‌سال باز.
 */
const ROLE_WIDGETS: Partial<Record<UserRole, readonly DashboardWidget[]>> = {
  student: [LEARNER_GRADES_WIDGET],
  skill_learner: [LEARNER_GRADES_WIDGET],
};

export function getDashboardWidgets(role: UserRole): DashboardWidget[] {
  return [...COMMON_WIDGETS, ...(ROLE_WIDGETS[role] ?? [])];
}

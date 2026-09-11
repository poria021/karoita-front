import type { MarketingPanelId } from './marketingPanelContext';

export const MARKETING_NAV_ITEMS: ReadonlyArray<{
  id: MarketingPanelId | null;
  label: string;
}> = [
  { id: null, label: 'خانه' },
  // { id: 'benefits', label: 'ارزش‌های عملیاتی' },
  { id: 'about', label: 'درباره ما' },
  { id: 'internship', label: 'سامانه کارآموزی' },
  { id: 'advantages', label: 'مزایای پلتفرم' },
];

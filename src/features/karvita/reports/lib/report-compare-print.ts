export type ReportComparePrintScope = 'table' | 'chart' | 'both';

export const REPORT_COMPARE_PRINT_OPTIONS: readonly {
  id: ReportComparePrintScope;
  label: string;
  description: string;
}[] = [
  {
    id: 'table',
    label: 'فقط جدول',
    description: 'یک پرینت از جدول مقایسه',
  },
  {
    id: 'chart',
    label: 'فقط نمودار',
    description: 'یک پرینت از نمودار مقایسه',
  },
  {
    id: 'both',
    label: 'جدول و نمودار',
    description: 'هر دو در یک پرینت؛ اول جدول، بعد نمودار',
  },
];

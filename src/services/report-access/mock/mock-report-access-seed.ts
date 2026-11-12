/**
 * کاتالوگ استان ماکت — هم‌تراز پروتوتایپ HTML گزارش‌ها.
 * تا وصل شدن بکند، ماتریس دسترسی از این فهرست استفاده می‌کند.
 */
export const MOCK_REPORT_ACCESS_PROVINCES: readonly {
  id: string;
  name: string;
}[] = [
  { id: 'p0', name: 'تهران' },
  { id: 'p1', name: 'خراسان رضوی' },
  { id: 'p2', name: 'اصفهان' },
  { id: 'p3', name: 'فارس' },
  { id: 'p4', name: 'آذربایجان شرقی' },
];

export function mockReportAccessProvinceCatalog(): {
  provinceIds: string[];
  provinceNames: Record<string, string>;
} {
  const provinceIds = MOCK_REPORT_ACCESS_PROVINCES.map((p) => p.id);
  const provinceNames: Record<string, string> = {};
  for (const p of MOCK_REPORT_ACCESS_PROVINCES) {
    provinceNames[p.id] = p.name;
  }
  return { provinceIds, provinceNames };
}

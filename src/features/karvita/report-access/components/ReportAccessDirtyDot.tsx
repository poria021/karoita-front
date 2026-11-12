'use client';

/** نشانگر تغییر ذخیره‌نشده — مشترک تب نقش و ردیف گزارش. */
export function ReportAccessDirtyDot() {
  return (
    <>
      <i
        className="inline-block size-1.5 shrink-0 rounded-full bg-kv-brand"
        title="تغییر ذخیره‌نشده"
        aria-hidden
      />
      <span className="sr-only">(تغییر ذخیره‌نشده)</span>
    </>
  );
}

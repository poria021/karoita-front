'use client';

import { useId, useMemo } from 'react';

import { KvSearchableOrganizationSelect } from '@/components/shared/fields/KvSearchableOrganizationSelect';

type FilterOption = {
  value: string;
  label: string;
};

type ReportSearchableFilterFieldProps = {
  label?: string | false;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  /** پیش‌فرض true — مقدار خالی = «همه». */
  allowClear?: boolean;
  placeholder?: string;
  /** جستجوی سمت سرور داخل همین باکس (`field=…&search=…`). */
  onSearch?: (text: string) => void;
  isLoading?: boolean;
};

/**
 * فیلتر گزارش — همان سلکت چیپ‌دار پروفایل (`KvSearchableOrganizationSelect`).
 */
export function ReportSearchableFilterField({
  label = false,
  value,
  options,
  onChange,
  allowClear = true,
  placeholder = 'همه',
  onSearch,
  isLoading = false,
}: ReportSearchableFilterFieldProps) {
  const rawId = useId();
  const fieldId = `rp-af-${rawId.replace(/:/g, '')}`;

  const selectOptions = useMemo(
    () => options.map((o) => ({ id: o.value, label: o.label })),
    [options]
  );

  return (
    <KvSearchableOrganizationSelect
      key={fieldId}
      label={label}
      placeholder={placeholder}
      value={value}
      options={selectOptions}
      allowEmpty={allowClear}
      emptyLabel="موردی یافت نشد."
      isLoading={isLoading}
      // با باز شدن دوباره، لیست کامل (بدون search) برگردد.
      onOpen={onSearch ? () => onSearch('') : undefined}
      onQueryChange={onSearch}
      onChange={(next) => {
        onChange(next);
      }}
    />
  );
}

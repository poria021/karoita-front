'use client';

import { useId, useMemo, useState } from 'react';

import { KvFieldFrame } from '@/components/shared/fields/KvFieldFrame';
import {
  KvSearchableCombobox,
  type KvSearchableComboboxItem,
} from '@/components/shared/fields/KvSearchableCombobox';

const ALL_ID = '__all__';

type FilterOption = {
  value: string;
  label: string;
};

type ReportSearchableFilterFieldProps = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

/**
 * فیلتر پیشرفته — سلکت سرچ‌پذیر (لیبل + جستجو در گزینه‌ها، «همه» برای پاک‌کردن).
 */
export function ReportSearchableFilterField({
  label,
  value,
  options,
  onChange,
}: ReportSearchableFilterFieldProps) {
  const rawId = useId();
  const fieldId = `rp-af-${rawId.replace(/:/g, '')}`;
  const selected = options.find((o) => o.value === value);
  const [query, setQuery] = useState(selected?.label ?? '');
  const [prevValue, setPrevValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);

  if (value !== prevValue) {
    setPrevValue(value);
    if (!isEditing) {
      setQuery(selected?.label ?? '');
    }
  }

  const items = useMemo((): KvSearchableComboboxItem[] => {
    const all: KvSearchableComboboxItem[] = [
      { id: ALL_ID, label: 'همه' },
      ...options.map((o) => ({ id: o.value, label: o.label })),
    ];
    const q = query.trim();
    if (!q || (selected && q === selected.label)) return all;
    const needle = q.toLocaleLowerCase('fa');
    return all.filter(
      (item) =>
        item.id === ALL_ID ||
        item.label.toLocaleLowerCase('fa').includes(needle)
    );
  }, [options, query, selected]);

  return (
    <KvFieldFrame id={`${fieldId}-label`} fieldId={fieldId} label={label}>
      <KvSearchableCombobox
        id={fieldId}
        value={query}
        placeholder="همه"
        items={items}
        emptyLabel="موردی یافت نشد."
        inputClassName="bg-kv-field"
        onChange={(next) => {
          setIsEditing(true);
          setQuery(next);
        }}
        onSelect={(item) => {
          setIsEditing(false);
          if (item.id === ALL_ID) {
            setQuery('');
            onChange('');
            return;
          }
          setQuery(item.label);
          onChange(item.id);
        }}
        onDismiss={() => {
          setIsEditing(false);
          setQuery(selected?.label ?? '');
        }}
      />
    </KvFieldFrame>
  );
}

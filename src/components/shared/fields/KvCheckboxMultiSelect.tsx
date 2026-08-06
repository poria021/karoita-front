'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvFieldFrame } from '@/components/shared/fields/KvFieldFrame';
import {
  KvDropdownMenu,
  KvDropdownMenuContent,
  KvDropdownMenuTrigger,
} from '@/components/shared/KvDropdownMenu';
import { DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

export type KvCheckboxMultiSelectOption = {
  value: string;
  label: string;
};

export type KvCheckboxMultiSelectProps = {
  id: string;
  label?: string | false;
  required?: boolean;
  options: readonly KvCheckboxMultiSelectOption[];
  values: string[];
  onValuesChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
};

export function KvCheckboxMultiSelect({
  id,
  label = false,
  required = false,
  options,
  values,
  onValuesChange,
  placeholder = 'انتخاب کنید',
  disabled = false,
  error,
  className,
}: KvCheckboxMultiSelectProps) {
  const selectedLabels = options
    .filter((option) => values.includes(option.value))
    .map((option) => option.label);

  const summary =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length === 1
        ? selectedLabels[0]
        : `${toPersianDigits(selectedLabels.length)} مورد انتخاب شده`;

  const toggleValue = (value: string, checked: boolean) => {
    if (checked) {
      if (values.includes(value)) return;
      onValuesChange([...values, value]);
      return;
    }
    onValuesChange(values.filter((item) => item !== value));
  };

  return (
    <KvFieldFrame id={id} label={label} required={required} error={error}>
      <KvDropdownMenu>
        <KvDropdownMenuTrigger asChild disabled={disabled}>
          <button
            type="button"
            id={id}
            aria-haspopup="listbox"
            aria-invalid={error ? true : undefined}
            className={cn(
              'flex h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-kv-pair rounded-kv-control',
              'border border-kv-border bg-kv-field ps-3.5 pe-2',
              'font-sans text-xs font-bold text-kv-text shadow-none',
              'outline-none transition-[color,background-color,border-color,box-shadow]',
              'focus-visible:border-kv-brand focus-visible:ring-[3px] focus-visible:ring-kv-ring/15',
              'data-[state=open]:border-kv-brand data-[state=open]:ring-[3px] data-[state=open]:ring-kv-ring/15',
              'disabled:cursor-not-allowed disabled:opacity-50',
              selectedLabels.length === 0 && 'text-kv-text-placeholder',
              className
            )}
          >
            <span className="min-w-0 truncate text-start">{summary}</span>
            <FaIcon
              icon={faIcons.chevronDown}
              size="xs"
              className="shrink-0 text-kv-text-muted"
            />
          </button>
        </KvDropdownMenuTrigger>
        <KvDropdownMenuContent
          align="start"
          className="max-h-64 w-[var(--radix-dropdown-menu-trigger-width)] min-w-[14rem] overflow-y-auto p-1"
        >
          {options.map((option) => {
            const checked = values.includes(option.value);
            return (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={checked}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={(next) => {
                  toggleValue(option.value, next === true);
                }}
                className="rounded-kv-control py-kv-pair text-xs font-bold"
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            );
          })}
        </KvDropdownMenuContent>
      </KvDropdownMenu>
    </KvFieldFrame>
  );
}

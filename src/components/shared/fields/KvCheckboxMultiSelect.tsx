'use client';

import type { SyntheticEvent } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvFieldFrame } from '@/components/shared/fields/KvFieldFrame';
import {
  KvDropdownMenu,
  KvDropdownMenuContent,
  KvDropdownMenuTrigger,
} from '@/components/shared/KvDropdownMenu';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

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
  const selectedOptions = values
    .map((value) => options.find((option) => option.value === value))
    .filter((option): option is KvCheckboxMultiSelectOption => Boolean(option));

  const toggleValue = (value: string, checked: boolean) => {
    if (checked) {
      if (values.includes(value)) return;
      onValuesChange([...values, value]);
      return;
    }
    onValuesChange(values.filter((item) => item !== value));
  };

  const removeValue = (event: SyntheticEvent, value: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    toggleValue(value, false);
  };

  return (
    <KvFieldFrame id={id} label={label} required={required} error={error}>
      <KvDropdownMenu>
        <KvDropdownMenuTrigger asChild disabled={disabled}>
          <div
            id={id}
            role="combobox"
            tabIndex={disabled ? -1 : 0}
            aria-haspopup="listbox"
            aria-invalid={error ? true : undefined}
            className={cn(
              'flex min-h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-kv-pair rounded-kv-control',
              'border border-kv-border bg-kv-field px-2 py-1.5',
              'font-sans text-xs font-bold text-kv-text shadow-none',
              'outline-none transition-[color,background-color,border-color,box-shadow]',
              'focus-visible:border-kv-brand focus-visible:ring-[3px] focus-visible:ring-kv-ring/15',
              'data-[state=open]:border-kv-brand data-[state=open]:ring-[3px] data-[state=open]:ring-kv-ring/15',
              disabled && 'cursor-not-allowed opacity-50',
              selectedOptions.length === 0 && 'ps-3.5 text-kv-text-placeholder',
              className
            )}
          >
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 text-start">
              {selectedOptions.length === 0
                ? placeholder
                : selectedOptions.map((option) => (
                    <Badge
                      key={option.value}
                      variant="brand"
                      className="max-w-full gap-1 pe-1"
                    >
                      <span className="min-w-0 truncate">{option.label}</span>
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={`حذف ${option.label}`}
                        disabled={disabled}
                        className={cn(
                          'inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-kv-tight',
                          'text-kv-brand-soft-fg hover:bg-kv-brand/15',
                          'outline-none focus-visible:ring-2 focus-visible:ring-kv-ring/30',
                          'disabled:pointer-events-none disabled:opacity-50'
                        )}
                        onPointerDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onClick={(event) => removeValue(event, option.value)}
                      >
                        <FaIcon icon={faIcons.xmark} size="2xs" />
                      </button>
                    </Badge>
                  ))}
            </span>
            <FaIcon
              icon={faIcons.chevronDown}
              size="xs"
              className="shrink-0 text-kv-text-muted"
            />
          </div>
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

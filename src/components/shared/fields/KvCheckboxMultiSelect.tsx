'use client';

import { useId, useState, type SyntheticEvent } from 'react';

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
  const rawAutoId = useId();
  const autoId = `kv${rawAutoId.replace(/:/g, '')}`;
  const fieldId = id ?? autoId;
  const listboxId = `${fieldId}-listbox`;
  const [isOpen, setIsOpen] = useState(false);

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
    <KvFieldFrame id={fieldId} label={label} required={required} error={error}>
      <KvDropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <KvDropdownMenuTrigger asChild disabled={disabled}>
          <div
            id={fieldId}
            role="combobox"
            aria-autocomplete="list"
            tabIndex={disabled ? -1 : 0}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={listboxId}
            aria-invalid={error ? true : undefined}
            aria-disabled={disabled || undefined}
            className={cn(
            'flex min-h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-kv-pair rounded-kv-control',
            'border border-kv-border bg-kv-field px-2 py-1',
            'font-sans text-xs font-bold text-kv-text-secondary shadow-none',
            'outline-none transition-[color,background-color,border-color,box-shadow]',
            'focus-visible:border-kv-brand focus-visible:ring-[3px] focus-visible:ring-kv-ring/15',
            'data-[state=open]:border-kv-brand data-[state=open]:ring-[3px] data-[state=open]:ring-kv-ring/15',
            disabled
              ? 'cursor-not-allowed border-kv-border-disabled bg-kv-field-disabled text-kv-text-disabled [&_svg]:text-kv-text-disabled focus-visible:border-kv-border-disabled focus-visible:ring-0'
              : selectedOptions.length === 0 && 'ps-3.5 text-kv-text-placeholder',
              disabled && 'ps-3.5',
              className
            )}
          >
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-start">
              {selectedOptions.length === 0
                ? placeholder
                : selectedOptions.map((option) => (
                    <Badge
                      key={option.value}
                      variant="brand"
                      className="max-w-full gap-0.5 rounded-kv-tight px-1.5 py-0.5 pe-0.5 font-medium leading-none"
                    >
                      <span className="min-w-0 truncate">{option.label}</span>
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={`حذف ${option.label}`}
                        disabled={disabled}
                        className={cn(
                          'inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-kv-tight',
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
              size="2xs"
              className="shrink-0 text-kv-text-placeholder"
            />
          </div>
        </KvDropdownMenuTrigger>

        <KvDropdownMenuContent
          align="start"
          id={listboxId}
          role="listbox"
          aria-label="گزینه‌های انتخاب‌شده"
          className="max-h-64 w-[var(--radix-dropdown-menu-trigger-width)] min-w-[14rem] p-0"
        >
          {options.map((option) => {
            const checked = values.includes(option.value);
            return (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={checked}
                role="option"
                aria-selected={checked}
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
import * as React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  persianToEnglishDigits,
  toPersianDigits,
} from '@/utils/persianDigits';

export type KvInputProps = React.ComponentProps<'input'>;

function displayNumericValue(
  value: React.ComponentProps<'input'>['value'] | undefined
) {
  if (value === undefined || value === null) return value;
  return toPersianDigits(persianToEnglishDigits(String(value)));
}

/**
 * فیلد مشترک. `type="number"` روی DOM `text` + `inputMode=numeric` است
 * تا ارقام فارسی دیده شوند؛ `onChange` همیشه English (`0-9`) می‌دهد.
 */
export function KvInput({
  className,
  ref,
  type,
  value,
  defaultValue,
  onChange,
  inputMode,
  ...props
}: KvInputProps) {
  const isNumberField = type === 'number';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isNumberField) {
      const input = event.target;
      const cursorPos = input.selectionStart ?? input.value.length;
      const raw = input.value;
      const next = persianToEnglishDigits(raw);
      if (next !== raw) {
        // تبدیل رقم‌به‌رقم است (طول تغییر نمی‌کند)، ولی نوشتن مستقیم روی
        // `.value` مکان‌نما را به انتهای متن می‌برد؛ باید صراحتاً برگردانیم.
        input.value = next;
        onChange?.(event);
        input.setSelectionRange(cursorPos, cursorPos);
        return;
      }
    }
    onChange?.(event);
  };

  return (
    <Input
      ref={ref}
      data-slot="kv-input"
      {...props}
      type={isNumberField ? 'text' : type}
      inputMode={inputMode ?? (isNumberField ? 'numeric' : undefined)}
      value={isNumberField ? displayNumericValue(value) : value}
      defaultValue={
        isNumberField ? displayNumericValue(defaultValue) : defaultValue
      }
      onChange={handleChange}
      className={cn(
        'h-11 w-full min-w-0 rounded-kv-control border border-kv-border bg-kv-field',
        'px-3.5 font-sans text-xs font-bold text-kv-text-secondary shadow-none md:text-xs',
        'placeholder:text-kv-text-placeholder',
        'transition-[color,background-color,border-color,box-shadow]',
        'can-hover:enabled:not-focus-visible:hover:border-kv-border-hover',
        'focus-visible:border-kv-brand focus-visible:bg-kv-field',
        'focus-visible:ring-[3px] focus-visible:ring-kv-ring/15',
        'aria-invalid:border-kv-danger-border aria-invalid:ring-[3px] aria-invalid:ring-kv-ring-danger/15',
        'aria-invalid:enabled:not-focus-visible:hover:border-kv-danger-border',
        'aria-invalid:focus-visible:border-kv-danger',
        'disabled:cursor-not-allowed disabled:opacity-100',
        'selection:bg-kv-brand selection:text-kv-brand-fg',
        className
      )}
      {...props}
    />
  );
}

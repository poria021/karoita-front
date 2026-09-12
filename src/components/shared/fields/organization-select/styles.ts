import { cn } from '@/lib/utils';

/**
 * تریگر چندانتخابی — همان کروم `KvCheckboxMultiSelect` تا ظاهر یکی بماند.
 */
export const multiTriggerClassName = cn(
  'flex min-h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-kv-pair rounded-kv-control',
  'border border-kv-border bg-kv-field px-2 py-1',
  'font-sans text-xs font-bold text-kv-text-secondary shadow-none',
  'outline-none transition-[color,background-color,border-color,box-shadow]',
  'focus-visible:border-kv-brand focus-visible:ring-[3px] focus-visible:ring-kv-ring/15',
  'data-[state=open]:border-kv-brand data-[state=open]:ring-[3px] data-[state=open]:ring-kv-ring/15'
);

/** قفل — همان توکن‌های `KvTextField` / `KvSelectField`. */
export const multiTriggerLockedClassName = cn(
  'cursor-not-allowed border-kv-border-disabled bg-kv-field-disabled',
  'text-kv-text-disabled [&_svg]:text-kv-text-disabled',
  'focus-visible:border-kv-border-disabled focus-visible:ring-0',
  'data-[state=open]:border-kv-border-disabled data-[state=open]:ring-0'
);

/** ردیف چک‌باکس — همان `DropdownMenuCheckboxItem`. */
export function multiCheckboxItemClassName(isSelected: boolean): string {
  return cn(
    'relative flex cursor-pointer items-center gap-2 rounded-kv-control py-kv-pair ps-8 pe-2',
    'text-xs font-bold outline-none select-none',
    'data-[selected=true]:bg-kv-brand-soft data-[selected=true]:text-kv-brand-soft-fg',
    isSelected && 'bg-kv-brand-soft text-kv-brand-soft-fg'
  );
}

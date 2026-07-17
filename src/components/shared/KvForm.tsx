'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
  useFormField,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export {
  Form as KvForm,
  FormControl as KvFormControl,
  FormDescription as KvFormDescription,
  FormField as KvFormField,
  FormMessage as KvFormMessage,
  useFormField,
};

export type KvFormItemProps = React.ComponentProps<typeof FormItem>;

/**
 * Form field stack — label → control uses `gap-kv-field` (same as KvTextField / KvLabel).
 */
export function KvFormItem({ className, ...props }: KvFormItemProps) {
  return (
    <FormItem
      data-slot="kv-form-item"
      className={cn('gap-kv-field', className)}
      {...props}
    />
  );
}

/**
 * Karvita form label — keeps slate color even when the field has an error.
 * (Shadcn FormLabel turns `text-kv-danger` on error; we never want that.)
 * No margin — spacing comes from KvFormItem gap.
 */
export function KvFormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { formItemId } = useFormField();

  return (
    <Label
      data-slot="kv-form-label"
      htmlFor={formItemId}
      className={cn(
        'font-sans text-xs font-bold text-kv-text-muted',
        className
      )}
      {...props}
    />
  );
}

'use client';

import * as React from 'react';
import { Label as LabelPrimitive } from 'radix-ui';

import { KvLabel } from '@/components/shared/fields/KvLabel';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
  useFormField,
} from '@/components/ui/form';
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

export function KvFormItem({ className, ...props }: KvFormItemProps) {
  return (
    <FormItem
      data-slot="kv-form-item"
      className={cn('gap-kv-field', className)}
      {...props}
    />
  );
}

export function KvFormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { formItemId } = useFormField();

  return (
    <KvLabel
      data-slot="kv-form-label"
      htmlFor={formItemId}
      className={cn('mb-0', className)}
      {...props}
    />
  );
}

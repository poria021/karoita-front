'use client';

import * as React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export type KvAccordionProps = React.ComponentProps<typeof Accordion>;
export type KvAccordionItemProps = React.ComponentProps<typeof AccordionItem>;
export type KvAccordionTriggerProps = React.ComponentProps<
  typeof AccordionTrigger
>;
export type KvAccordionContentProps = React.ComponentProps<
  typeof AccordionContent
>;

/**
 * Product accordion root — controlled via `value` / `onValueChange`
 * (`type="single"` + `collapsible` for exclusive panels).
 */
export function KvAccordion({ className, ...props }: KvAccordionProps) {
  return (
    <Accordion
      data-slot="kv-accordion"
      className={cn('w-full', className)}
      {...props}
    />
  );
}

/** One accordion row — panel chrome when used as a card stack. */
export function KvAccordionItem({
  className,
  ...props
}: KvAccordionItemProps) {
  return (
    <AccordionItem
      data-slot="kv-accordion-item"
      className={cn(
        'mb-3 overflow-hidden rounded-kv-panel border border-kv-border bg-kv-surface shadow-kv-raised last:mb-0',
        className
      )}
      {...props}
    />
  );
}

export function KvAccordionTrigger({
  className,
  ...props
}: KvAccordionTriggerProps) {
  return (
    <AccordionTrigger
      data-slot="kv-accordion-trigger"
      className={cn('px-4 hover:no-underline', className)}
      {...props}
    />
  );
}

export function KvAccordionContent({
  className,
  ...props
}: KvAccordionContentProps) {
  return (
    <AccordionContent
      data-slot="kv-accordion-content"
      className={cn(
        'border-t border-kv-border px-4 text-kv-text-secondary',
        className
      )}
      {...props}
    />
  );
}

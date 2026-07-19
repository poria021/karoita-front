'use client';

import * as React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';

export type KvAccordionProps = React.ComponentProps<typeof Accordion>;
export type KvAccordionItemProps = React.ComponentProps<typeof AccordionItem>;
export type KvAccordionTriggerProps = React.ComponentProps<
  typeof AccordionTrigger
>;
export type KvAccordionContentProps = React.ComponentProps<
  typeof AccordionContent
> & {
  /** Stack children with section gap. */
  stacked?: boolean;
};

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
      className={cn(
        'px-kv-inset py-kv-group hover:bg-kv-surface-muted/50 hover:no-underline',
        'data-[state=open]:bg-kv-brand-soft data-[state=open]:text-kv-brand',
        'data-[state=open]:hover:bg-kv-brand-soft-hover',
        className
      )}
      {...props}
    />
  );
}

export type KvAccordionTriggerMetaProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  trailing?: React.ReactNode;
};

/**
 * Title / meta / trailing badge cluster for accordion triggers.
 * Owns truncation + spacing — pass strings or ready nodes.
 */
export function KvAccordionTriggerMeta({
  title,
  description,
  trailing,
}: KvAccordionTriggerMetaProps) {
  return (
    <div
      data-slot="kv-accordion-trigger-meta"
      className="flex min-w-0 flex-1 items-center justify-between gap-kv-group pe-kv-pair"
    >
      <div className="min-w-0 text-start">
        {typeof title === 'string' ? (
          <KvTypography
            variant="subtitle"
            weight="black"
            truncate
            as="span"
          >
            {title}
          </KvTypography>
        ) : (
          title
        )}
        {description ? (
          typeof description === 'string' ? (
            <KvTypography variant="caption" tone="muted" truncate as="p">
              {description}
            </KvTypography>
          ) : (
            description
          )
        ) : null}
      </div>
      {trailing}
    </div>
  );
}

export function KvAccordionContent({
  className,
  stacked = false,
  ...props
}: KvAccordionContentProps) {
  return (
    <AccordionContent
      data-slot="kv-accordion-content"
      className={cn(
        /* No full-bleed header rule — inset separator + DS horizontal padding. */
        'mx-kv-inset border-t border-kv-border px-0 pb-kv-inset text-kv-text-secondary',
        stacked && 'space-y-kv-group pt-kv-section',
        className
      )}
      {...props}
    />
  );
}

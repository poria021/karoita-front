import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

export type KvTypographyVariant =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'label'
  | 'caption'
  | 'overline'
  | 'error';

export type KvTypographyTone =
  | 'default'
  | 'muted'
  | 'disabled'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type KvTypographyElement =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'p'
  | 'span'
  | 'div'
  | 'label';

const kvTypographyVariants = cva('font-sans', {
  variants: {
    variant: {
      /** Brand wordmark / marketing heroes */
      display: 'text-3xl font-black leading-[1.15] tracking-tight sm:text-4xl',
      /** Section / page headings */
      title: 'text-sm font-bold leading-snug tracking-tight sm:text-base',
      /** Secondary headings inside cards/sections */
      subtitle: 'text-xs font-bold leading-snug',
      /** Supporting copy */
      body: 'text-xs font-medium leading-relaxed',
      /** Field labels */
      label: 'text-xs font-bold leading-none',
      /** Helper / meta under titles */
      caption: 'text-xs font-medium leading-normal',
      /** Quiet chrome / footnotes */
      overline: 'text-xs font-medium leading-normal tracking-wide',
      error: 'text-xs font-bold leading-normal',
    },
    tone: {
      default: 'text-kv-text',
      muted: 'text-kv-text-faint',
      disabled: 'text-kv-text-disabled',
      brand: 'text-kv-brand-soft-fg',
      success: 'text-kv-success',
      warning: 'text-kv-warning',
      danger: 'text-kv-danger',
      info: 'text-kv-info',
    },
    weight: {
      medium: 'font-medium',
      bold: 'font-bold',
      black: 'font-black',
    },
    align: {
      start: 'text-start',
      center: 'text-center',
      end: 'text-end',
    },
    truncate: {
      true: 'truncate',
      false: '',
    },
  },
  compoundVariants: [
    { variant: 'body', tone: 'default', class: 'text-kv-text-secondary' },
    { variant: 'label', tone: 'default', class: 'text-kv-text-muted' },
    { variant: 'error', tone: 'default', class: 'text-kv-danger' },
    { variant: 'caption', tone: 'default', class: 'text-kv-text-faint' },
    { variant: 'overline', tone: 'default', class: 'text-kv-text-faint' },
  ],
  defaultVariants: {
    variant: 'body',
    tone: 'default',
    truncate: false,
  },
});

const DEFAULT_ELEMENT: Record<KvTypographyVariant, KvTypographyElement> = {
  display: 'h1',
  title: 'h1',
  subtitle: 'h3',
  body: 'p',
  label: 'label',
  caption: 'p',
  overline: 'span',
  error: 'p',
};

export type KvTypographyProps = {
  variant: KvTypographyVariant;
  tone?: KvTypographyTone;
  as?: KvTypographyElement;
  weight?: 'medium' | 'bold' | 'black';
  align?: 'start' | 'center' | 'end';
  truncate?: boolean;
  htmlFor?: string;
  id?: string;
  children: React.ReactNode;
  /** Forbidden — force design-system consistency */
  className?: never;
} & Omit<
  VariantProps<typeof kvTypographyVariants>,
  'variant' | 'tone' | 'weight' | 'align' | 'truncate'
>;

/**
 * Shared Karvita content typography.
 * Prefer this for page/section copy — not for text baked into Button/Tabs/Select.
 */
export function KvTypography({
  variant,
  tone = 'default',
  as,
  weight,
  align,
  truncate = false,
  htmlFor,
  id,
  children,
}: KvTypographyProps) {
  const Component = as ?? DEFAULT_ELEMENT[variant];

  return (
    <Component
      id={id}
      htmlFor={Component === 'label' ? htmlFor : undefined}
      className={cn(
        kvTypographyVariants({
          variant,
          tone,
          weight,
          align,
          truncate,
        })
      )}
    >
      {children}
    </Component>
  );
}

export { kvTypographyVariants };

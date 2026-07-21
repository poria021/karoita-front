import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

export type KvTypographyVariant =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'nav'
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
      display: 'text-3xl font-black leading-[1.15] tracking-tight sm:text-4xl',
      title: 'text-sm font-bold leading-snug tracking-tight sm:text-base',
      subtitle: 'text-xs font-bold leading-snug',
      /* 12px medium — shell/sidebar nav (dense admin; hierarchy via weight/color) */
      nav: 'text-xs font-medium leading-snug',
      body: 'text-xs font-medium leading-relaxed',
      label: 'text-xs font-bold leading-none',
      caption: 'text-xs font-medium leading-normal',
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
    { variant: 'nav', tone: 'default', class: 'text-kv-text-muted' },
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
  nav: 'span',
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
  className?: never;
} & Omit<
  VariantProps<typeof kvTypographyVariants>,
  'variant' | 'tone' | 'weight' | 'align' | 'truncate'
>;

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

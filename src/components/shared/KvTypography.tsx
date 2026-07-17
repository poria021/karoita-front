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
      display: 'text-2xl font-black leading-tight sm:text-3xl',
      title: 'text-sm font-black leading-tight',
      subtitle: 'text-xs font-black leading-tight',
      body: 'text-xs font-medium leading-relaxed',
      label: 'text-xs font-bold leading-none',
      caption: 'text-[11px] font-bold leading-normal',
      overline: 'text-[10px] font-bold leading-normal',
      error: 'text-[11px] font-bold leading-normal',
    },
    tone: {
      default: 'text-kv-text',
      muted: 'text-kv-text-faint',
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

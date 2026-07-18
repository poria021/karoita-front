import * as React from 'react';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type KvCardTone = 'surface' | 'muted' | 'danger';
export type KvCardPadding = 'none' | 'sm' | 'md' | 'lg';

export type KvCardProps = React.ComponentProps<typeof Card> & {
  /**
   * Surface role for nested admin panels.
   * `muted` = outer well; `surface` = raised card; `danger` = soft reject wells.
   */
  tone?: KvCardTone;
  /** Built-in padding — prefer over feature className. */
  padding?: KvCardPadding;
  /** Stretch to fill a split-pane minimum height. */
  fillMin?: boolean;
};

export type KvCardContentProps = React.ComponentProps<typeof CardContent> & {
  padding?: KvCardPadding;
  /** Stack children with section gap. */
  stacked?: boolean;
};

const TONE_CLASS: Record<KvCardTone, string> = {
  surface: 'border-kv-border bg-kv-surface shadow-kv-raised',
  muted: 'border-kv-border bg-kv-surface-muted shadow-kv-raised',
  danger: 'border-kv-danger-border bg-kv-danger-soft shadow-none',
};

const PADDING_CLASS: Record<KvCardPadding, string> = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const CONTENT_PADDING_CLASS: Record<KvCardPadding, string> = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'px-6 py-4',
  lg: 'p-6',
};

/** Karvita card shell — surface, card radius, elevation via `tone`. */
export function KvCard({
  className,
  tone = 'surface',
  padding = 'none',
  fillMin = false,
  ...props
}: KvCardProps) {
  return (
    <Card
      data-slot="kv-card"
      className={cn(
        'overflow-hidden gap-0 font-sans text-kv-text',
        TONE_CLASS[tone],
        PADDING_CLASS[padding],
        fillMin && 'flex min-h-[28rem] flex-col justify-center',
        className
      )}
      {...props}
    />
  );
}

export function KvCardContent({
  className,
  padding = 'md',
  stacked = false,
  ...props
}: KvCardContentProps) {
  return (
    <CardContent
      data-slot="kv-card-content"
      className={cn(
        CONTENT_PADDING_CLASS[padding],
        stacked && 'space-y-kv-group',
        className
      )}
      {...props}
    />
  );
}

export type KvCardHeaderProps = React.ComponentProps<typeof CardHeader> & {
  /** Toolbar-style header: title cluster + actions on one row. */
  toolbar?: boolean;
  bordered?: boolean;
};

export function KvCardHeader({
  className,
  toolbar = false,
  bordered = false,
  ...props
}: KvCardHeaderProps) {
  return (
    <CardHeader
      data-slot="kv-card-header"
      className={cn(
        toolbar &&
          'mb-kv-section flex flex-row flex-wrap items-center justify-between gap-kv-group space-y-0 px-0 pb-kv-section [&_[data-slot=kv-card-action]]:self-center',
        bordered && 'border-b border-kv-border',
        className
      )}
      {...props}
    />
  );
}

export function KvCardTitle({
  className,
  ...props
}: React.ComponentProps<typeof CardTitle>) {
  return (
    <CardTitle
      data-slot="kv-card-title"
      className={cn(
        'font-sans text-xs font-extrabold text-kv-text sm:text-sm',
        className
      )}
      {...props}
    />
  );
}

export function KvCardDescription({
  className,
  ...props
}: React.ComponentProps<typeof CardDescription>) {
  return (
    <CardDescription
      data-slot="kv-card-description"
      className={cn('mt-1 font-sans text-xs font-bold text-kv-text-faint', className)}
      {...props}
    />
  );
}

export function KvCardFooter({
  className,
  ...props
}: React.ComponentProps<typeof CardFooter>) {
  return (
    <CardFooter
      data-slot="kv-card-footer"
      className={cn('flex items-center justify-end gap-kv-pair', className)}
      {...props}
    />
  );
}

export function KvCardAction({
  className,
  ...props
}: React.ComponentProps<typeof CardAction>) {
  return (
    <CardAction
      data-slot="kv-card-action"
      className={cn('flex gap-kv-pair', className)}
      {...props}
    />
  );
}

export type KvCardIdentityProps = {
  leading?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Leading media + title/description cluster for toolbar card headers.
 */
export function KvCardIdentity({ leading, children }: KvCardIdentityProps) {
  return (
    <div
      data-slot="kv-card-identity"
      className="flex min-w-0 items-center gap-kv-group"
    >
      {leading}
      <div className="min-w-0">{children}</div>
    </div>
  );
}


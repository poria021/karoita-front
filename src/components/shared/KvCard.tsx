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

export type KvCardTone = 'surface' | 'muted';

export type KvCardProps = React.ComponentProps<typeof Card> & {
  /**
   * Surface role for nested admin panels.
   * `muted` = outer well; `surface` = raised card (default).
   */
  tone?: KvCardTone;
};

export type KvCardContentProps = React.ComponentProps<typeof CardContent>;

const TONE_CLASS: Record<KvCardTone, string> = {
  surface: 'bg-kv-surface',
  muted: 'bg-kv-surface-muted',
};

/** Karvita card shell — surface, card radius, raised elevation. */
export function KvCard({
  className,
  tone = 'surface',
  ...props
}: KvCardProps) {
  return (
    <Card
      data-slot="kv-card"
      className={cn(
        'overflow-visible gap-0 border-kv-border font-sans text-kv-text shadow-kv-raised',
        TONE_CLASS[tone],
        className
      )}
      {...props}
    />
  );
}

export function KvCardContent({ className, ...props }: KvCardContentProps) {
  return (
    <CardContent
      data-slot="kv-card-content"
      className={cn(className)}
      {...props}
    />
  );
}

export function KvCardHeader({
  className,
  ...props
}: React.ComponentProps<typeof CardHeader>) {
  return (
    <CardHeader
      data-slot="kv-card-header"
      className={cn(className)}
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
      className={cn('font-sans text-base font-extrabold text-kv-text', className)}
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
      className={cn('font-sans text-xs text-kv-text-faint', className)}
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
      className={cn(className)}
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
      className={cn(className)}
      {...props}
    />
  );
}

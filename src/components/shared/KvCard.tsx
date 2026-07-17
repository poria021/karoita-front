import * as React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type KvCardProps = React.ComponentProps<typeof Card>;
export type KvCardContentProps = React.ComponentProps<typeof CardContent>;

/** Karvita card shell — white, rounded-kv-card, soft border. */
export function KvCard({ className, ...props }: KvCardProps) {
  return (
    <Card
      data-slot="kv-card"
      className={cn(
        'overflow-visible rounded-kv-card border-slate-200 bg-white font-sans shadow-sm',
        className
      )}
      {...props}
    />
  );
}

export function KvCardContent({ className, ...props }: KvCardContentProps) {
  return <CardContent data-slot="kv-card-content" className={className} {...props} />;
}

export {
  CardHeader as KvCardHeader,
  CardTitle as KvCardTitle,
  CardDescription as KvCardDescription,
  CardFooter as KvCardFooter,
};

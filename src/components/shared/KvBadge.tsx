import * as React from 'react';
import type { VariantProps } from 'class-variance-authority';

import { Badge, badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type KvBadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>['variant']
>;

export type KvBadgeProps = Omit<React.ComponentProps<typeof Badge>, 'variant'> & {
  variant?: KvBadgeVariant;
};

export function KvBadge({
  className,
  variant = 'default',
  ...props
}: KvBadgeProps) {
  return (
    <Badge
      data-slot="kv-badge"
      variant={variant}
      className={cn(className)}
      {...props}
    />
  );
}

export { badgeVariants as kvBadgeVariants };

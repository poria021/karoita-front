'use client';

import * as React from 'react';

import { KvLabel } from '@/components/shared/fields/KvLabel';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export type KvSwitchSize = 'sm' | 'md' | 'lg';

export type KvSwitchProps = Omit<
  React.ComponentProps<typeof Switch>,
  'size'
> & {
  size?: KvSwitchSize;
  label?: string;
  labelClassName?: string;
};

const SIZE_TO_UI: Record<KvSwitchSize, 'sm' | 'default'> = {
  sm: 'sm',
  md: 'default',
  lg: 'default',
};

export function KvSwitch({
  className,
  size = 'md',
  label,
  labelClassName,
  id: idProp,
  disabled,
  ...props
}: KvSwitchProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;

  const control = (
    <Switch
      id={id}
      data-slot="kv-switch"
      size={SIZE_TO_UI[size]}
      disabled={disabled}
      className={cn(
        size === 'lg' && 'data-[size=default]:h-8 data-[size=default]:w-14',
        className
      )}
      {...props}
    />
  );

  if (!label) return control;

  return (
    <div
      className={cn(
        'flex items-center gap-2.5',
        disabled && 'opacity-60'
      )}
      data-slot="kv-switch-field"
    >
      <KvLabel
        htmlFor={id}
        className={cn('mb-0 cursor-pointer', labelClassName)}
      >
        {label}
      </KvLabel>
      {control}
    </div>
  );
}

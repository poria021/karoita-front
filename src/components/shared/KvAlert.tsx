'use client';

import { useState, type ReactNode } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import type { KvTypographyTone } from '@/components/shared/KvTypography';
import { faIcons } from '@/utils/iconMap';

export type KvAlertVariant = 'success' | 'info' | 'warning' | 'error';

export type KvAlertProps = {
  variant: KvAlertVariant;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  dismissible?: boolean;
  defaultVisible?: boolean;
  onDismiss?: () => void;
};

const VARIANT_TO_ALERT = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  error: 'destructive',
} as const;

const VARIANT_TO_TONE: Record<KvAlertVariant, KvTypographyTone> = {
  success: 'success',
  info: 'brand',
  warning: 'warning',
  error: 'danger',
};

const DEFAULT_ICONS: Record<KvAlertVariant, ReactNode> = {
  success: <FaIcon icon={faIcons.circleCheck} size="sm" />,
  info: <FaIcon icon={faIcons.circleInfo} size="sm" />,
  warning: <FaIcon icon={faIcons.circleExclamation} size="sm" />,
  error: <FaIcon icon={faIcons.circleXmark} size="sm" />,
};

const DISMISS_BUTTON_COLOR: Record<
  KvAlertVariant,
  'success' | 'cta' | 'warning' | 'error'
> = {
  success: 'success',
  info: 'cta',
  warning: 'warning',
  error: 'error',
};

export function KvAlert({
  variant,
  title,
  description,
  icon,
  actions,
  dismissible = false,
  defaultVisible = true,
  onDismiss,
}: KvAlertProps) {
  const [visible, setVisible] = useState(defaultVisible);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <Alert
      variant={VARIANT_TO_ALERT[variant]}
      className={cn('relative font-sans shadow-kv-raised', dismissible && 'pe-10')}
    >
      {icon ?? DEFAULT_ICONS[variant]}
      <AlertTitle>
        <KvTypography variant="subtitle" tone={VARIANT_TO_TONE[variant]} as="span">
          {title}
        </KvTypography>
      </AlertTitle>
      {description ? (
        <AlertDescription>
          {typeof description === 'string' ? (
            <KvTypography variant="caption" tone={VARIANT_TO_TONE[variant]} as="span" weight="medium">
              {description}
            </KvTypography>
          ) : (
            description
          )}
        </AlertDescription>
      ) : null}
      {actions ? (
        <div className="col-start-2 mt-2 flex flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
      {dismissible ? (
        <KvButton
          type="button"
          color={DISMISS_BUTTON_COLOR[variant]}
          appearance="text"
          aria-label="بستن پیام"
          className="absolute end-3 top-3"
          onClick={handleDismiss}
          icon={<FaIcon icon={faIcons.xmark} size="sm" />}
        />
      ) : null}
    </Alert>
  );
}

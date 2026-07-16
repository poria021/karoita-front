'use client';

import {
  CircleAlert,
  CircleCheck,
  CircleX,
  Info,
  X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import type { KvTypographyTone } from '@/components/shared/KvTypography';

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
  success: <CircleCheck aria-hidden="true" />,
  info: <Info aria-hidden="true" />,
  warning: <CircleAlert aria-hidden="true" />,
  error: <CircleX aria-hidden="true" />,
};

const DISMISS_BUTTON_STYLES: Record<KvAlertVariant, string> = {
  success: 'text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800',
  info: 'text-blue-600 hover:bg-blue-100 hover:text-blue-800',
  warning: 'text-amber-600 hover:bg-amber-100 hover:text-amber-800',
  error: 'text-rose-600 hover:bg-rose-100 hover:text-rose-800',
};

/**
 * Shared Karvita alert — use across domains.
 * Profile/auth/etc. only choose variant + copy; they do not own alert chrome.
 */
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
      className={cn('relative font-sans shadow-sm', dismissible && 'pe-10')}
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
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="بستن پیام"
          className={cn(
            'absolute end-3 top-3',
            DISMISS_BUTTON_STYLES[variant]
          )}
          onClick={handleDismiss}
        >
          <X className="size-4" />
        </Button>
      ) : null}
    </Alert>
  );
}

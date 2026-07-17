import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';

import { KvButton } from '@/components/shared/KvButton';
import { cn } from '@/lib/utils';

import type { AuthFormMessageState } from '../../types';

interface AuthFormMessageProps {
  message: AuthFormMessageState | null;
  onDismiss: () => void;
}

const MESSAGE_STYLES: Record<
  AuthFormMessageState['type'],
  { container: string; icon: string; Icon: typeof CircleAlert }
> = {
  error: {
    container: 'border-kv-danger-border bg-kv-danger-soft/60 text-kv-danger-soft-fg',
    icon: 'text-kv-danger',
    Icon: CircleAlert,
  },
  success: {
    container: 'border-kv-success-border bg-kv-success-soft/60 text-kv-success-soft-fg',
    icon: 'text-kv-success',
    Icon: CircleCheck,
  },
  info: {
    container: 'border-kv-info-border bg-kv-info-soft/60 text-kv-info-soft-fg',
    icon: 'text-kv-info',
    Icon: Info,
  },
};

/** Dismissible feedback banner shown above the auth forms. */
export function AuthFormMessage({ message, onDismiss }: AuthFormMessageProps) {
  if (!message) return null;

  const { container, icon, Icon } = MESSAGE_STYLES[message.type];

  return (
    <div
      className={cn(
        'mb-kv-group flex w-full items-start gap-kv-inline rounded-kv-panel border p-3 text-start transition-all',
        container
      )}
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', icon)} aria-hidden="true" />
      <p className="flex-1 text-xs font-semibold">{message.text}</p>
      <KvButton
        type="button"
        color="neutral"
        appearance="text"
        icon={<X className="size-3.5" aria-hidden="true" />}
        onClick={onDismiss}
        aria-label="بستن پیام"
        className="shrink-0"
      />
    </div>
  );
}

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { cn } from '@/lib/utils';
import { faIcons } from '@/utils/iconMap';

import type { AuthFormMessageState } from '../../types';

interface AuthFormMessageProps {
  message: AuthFormMessageState | null;
  onDismiss: () => void;
}

const MESSAGE_STYLES: Record<
  AuthFormMessageState['type'],
  {
    container: string;
    icon: string;
    iconDef: (typeof faIcons)[keyof typeof faIcons];
  }
> = {
  error: {
    container: 'border-kv-danger-border bg-kv-danger-soft/60 text-kv-danger-soft-fg',
    icon: 'text-kv-danger',
    iconDef: faIcons.circleExclamation,
  },
  success: {
    container: 'border-kv-success-border bg-kv-success-soft/60 text-kv-success-soft-fg',
    icon: 'text-kv-success',
    iconDef: faIcons.circleCheck,
  },
  info: {
    container: 'border-kv-info-border bg-kv-info-soft/60 text-kv-info-soft-fg',
    icon: 'text-kv-info',
    iconDef: faIcons.circleInfo,
  },
};

/** Dismissible feedback banner shown above the auth forms. */
export function AuthFormMessage({ message, onDismiss }: AuthFormMessageProps) {
  if (!message) return null;

  const { container, icon, iconDef } = MESSAGE_STYLES[message.type];

  return (
    <div
      role={message.type === 'error' ? 'alert' : 'status'}
      aria-live={message.type === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'mb-kv-group flex w-full items-start gap-kv-inline rounded-kv-panel border p-kv-inline text-start transition-all',
        container
      )}
    >
      <FaIcon icon={iconDef} size="sm" className={cn('mt-kv-field shrink-0', icon)} />
      <p className="flex-1 text-xs font-semibold">{message.text}</p>
      <KvButton
        type="button"
        color="neutral"
        appearance="text"
        icon={<FaIcon icon={faIcons.xmark} size="xs" />}
        onClick={onDismiss}
        aria-label="بستن پیام"
        className="shrink-0"
      />
    </div>
  );
}

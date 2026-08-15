import type { CSSProperties } from 'react';
import { toast } from 'sonner';

export const UNDOABLE_MUTATION_DEFAULT_MS = 5_000;

export type UndoableToastTone = 'default' | 'success' | 'error' | 'warning';

export type UndoableMutationOptions<T> = {
  /** Past-tense result copy (shown immediately; single toast, no follow-up success). */
  message: string;
  description?: string;
  undoLabel?: string;
  durationMs?: number;
  tone?: UndoableToastTone;
  /** Apply optimistic UI immediately so the user sees the change. */
  apply: () => void;
  /** Restore UI when the user presses Undo (and on commit failure). */
  revert: () => void;
  /** Runs only if the user does not undo before the toast closes. */
  commit: () => Promise<T>;
  onCommitted?: (result: T) => void | Promise<void>;
  onUndone?: () => void;
  onError?: (error: unknown) => void;
};

export type UndoableLocalChangeOptions = {
  message: string;
  description?: string;
  undoLabel?: string;
  durationMs?: number;
  tone?: UndoableToastTone;
  /** Apply the local UI change immediately. */
  apply: () => void;
  /** Revert when the user presses Undo. */
  revert: () => void;
};

function undoableToastChrome(
  tone: UndoableToastTone,
  durationMs: number
): Pick<
  NonNullable<Parameters<typeof toast>[1]>,
  'className' | 'style' | 'actionButtonStyle'
> {
  const style = {
    ['--kv-toast-duration' as string]: `${durationMs}ms`,
  } as CSSProperties;

  if (tone === 'success') {
    return {
      className: 'kv-toast-undoable kv-toast-undoable--success',
      style,
      actionButtonStyle: {
        background: 'var(--kv-success)',
        color: 'var(--kv-success-fg)',
        borderRadius: 'var(--radius-kv-control)',
      },
    };
  }

  return {
    className: 'kv-toast-undoable',
    style,
  };
}

function showUndoableToast(
  tone: UndoableToastTone,
  message: string,
  options: Parameters<typeof toast>[1]
): string | number {
  if (tone === 'error') return toast.error(message, options);
  if (tone === 'warning') return toast.warning(message, options);
  if (tone === 'success') return toast.success(message, options);
  return toast(message, options);
}

function defaultUndoDescription(undoLabel: string): string {
  return `برای لغو، قبل از پایان زمان روی «${undoLabel}» بزنید.`;
}

/**
 * Optimistic undoable Facade write: UI updates immediately, API commits after
 * the toast window unless Undo restores the previous UI and cancels the send.
 * One toast only — do not call toast.success in onCommitted.
 */
export function scheduleUndoableMutation<T>(
  options: UndoableMutationOptions<T>
): string | number {
  let cancelled = false;
  let settled = false;

  const durationMs = options.durationMs ?? UNDOABLE_MUTATION_DEFAULT_MS;
  const undoLabel = options.undoLabel ?? 'لغو';
  const description =
    options.description ?? defaultUndoDescription(undoLabel);
  const tone = options.tone ?? 'default';

  options.apply();

  const runCommit = () => {
    if (cancelled || settled) return;
    settled = true;

    void (async () => {
      try {
        const result = await options.commit();
        await options.onCommitted?.(result);
      } catch (error) {
        options.revert();
        if (options.onError) {
          options.onError(error);
          return;
        }
        toast.error(
          error instanceof Error ? error.message : 'عملیات ناموفق بود.'
        );
      }
    })();
  };

  return showUndoableToast(tone, options.message, {
    id: `undoable-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description,
    duration: durationMs,
    ...undoableToastChrome(tone, durationMs),
    action: {
      label: undoLabel,
      onClick: () => {
        if (settled) return;
        cancelled = true;
        settled = true;
        options.revert();
        options.onUndone?.();
      },
    },
    onAutoClose: () => {
      runCommit();
    },
    onDismiss: () => {
      // Swipe / X without Undo still commits (Gmail-style).
      runCommit();
    },
  });
}

/**
 * Apply a local UI change immediately, with a single undo toast (no second alert).
 */
export function scheduleUndoableLocalChange(
  options: UndoableLocalChangeOptions
): string | number {
  let undone = false;
  const durationMs = options.durationMs ?? UNDOABLE_MUTATION_DEFAULT_MS;
  const undoLabel = options.undoLabel ?? 'لغو';
  const description =
    options.description ?? defaultUndoDescription(undoLabel);
  const tone = options.tone ?? 'default';

  options.apply();

  return showUndoableToast(tone, options.message, {
    id: `undoable-local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description,
    duration: durationMs,
    ...undoableToastChrome(tone, durationMs),
    action: {
      label: undoLabel,
      onClick: () => {
        if (undone) return;
        undone = true;
        options.revert();
      },
    },
  });
}

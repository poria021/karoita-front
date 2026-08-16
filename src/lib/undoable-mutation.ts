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
  /**
   * Persist via Facade immediately after apply so a refresh keeps the change.
   * Do not defer writes until toast close — mock localStorage must survive reload.
   */
  commit: () => Promise<T>;
  /**
   * Undo after a successful commit — reverse the Facade write, then `revert` runs.
   * Required for Undo to restore persisted mock/real state, not only the UI snapshot.
   */
  reverse?: (result: T) => Promise<void>;
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

  return {
    className: 'kv-toast-undoable',
    style,
    actionButtonStyle: {
      background: 'var(--kv-danger-soft)',
      color: 'var(--kv-danger-soft-fg)',
      borderRadius: 'var(--radius-kv-control)',
      border: '1px solid var(--kv-danger-border)',
      paddingLeft: '0.85rem',
      paddingRight: '0.85rem',
    },
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

/**
 * Optimistic undoable Facade write: UI updates and commit run immediately so
 * refresh keeps mock/local persistence. Undo calls `reverse` (when provided)
 * then restores the prior UI. One toast only — no follow-up success toast.
 */
export function scheduleUndoableMutation<T>(
  options: UndoableMutationOptions<T>
): string | number {
  let undone = false;
  let commitFailed = false;
  let committedResult: T | undefined;

  const durationMs = options.durationMs ?? UNDOABLE_MUTATION_DEFAULT_MS;
  const undoLabel = options.undoLabel ?? 'لغو';
  const description = options.description;
  const tone = options.tone ?? 'default';

  options.apply();

  const commitPromise = (async () => {
    try {
      const result = await options.commit();
      committedResult = result;
      await options.onCommitted?.(result);
      return result;
    } catch (error) {
      commitFailed = true;
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

  return showUndoableToast(tone, options.message, {
    id: `undoable-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description,
    duration: durationMs,
    ...undoableToastChrome(tone, durationMs),
    action: {
      label: undoLabel,
      onClick: () => {
        if (undone || commitFailed) return;
        undone = true;
        void (async () => {
          await commitPromise;
          if (commitFailed) return;
          try {
            if (options.reverse && committedResult !== undefined) {
              await options.reverse(committedResult);
            }
            options.revert();
            options.onUndone?.();
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : 'لغو عملیات ناموفق بود.'
            );
          }
        })();
      },
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
  const description = options.description;
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

import { toast } from 'sonner';

export const UNDOABLE_MUTATION_DEFAULT_MS = 5_000;

export type UndoableToastTone = 'default' | 'error' | 'warning';

export type UndoableMutationOptions<T> = {
  /** Pending copy shown while waiting for undo window. */
  message: string;
  description?: string;
  undoLabel?: string;
  durationMs?: number;
  tone?: UndoableToastTone;
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

function showUndoableToast(
  tone: UndoableToastTone,
  message: string,
  options: Parameters<typeof toast>[1]
): string | number {
  if (tone === 'error') return toast.error(message, options);
  if (tone === 'warning') return toast.warning(message, options);
  return toast(message, options);
}

/**
 * Show a toast with Undo; defer the Facade/API `commit` until the toast
 * auto-closes (or is dismissed without undo). Undo cancels the send.
 */
export function scheduleUndoableMutation<T>(
  options: UndoableMutationOptions<T>
): string | number {
  let cancelled = false;
  let settled = false;

  const durationMs = options.durationMs ?? UNDOABLE_MUTATION_DEFAULT_MS;
  const undoLabel = options.undoLabel ?? 'بازگردانی';
  const description =
    options.description ??
    'برای لغو، قبل از پایان زمان روی بازگردانی بزنید.';
  const tone = options.tone ?? 'default';

  const runCommit = () => {
    if (cancelled || settled) return;
    settled = true;

    void (async () => {
      try {
        const result = await options.commit();
        await options.onCommitted?.(result);
      } catch (error) {
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
    action: {
      label: undoLabel,
      onClick: () => {
        if (settled) return;
        cancelled = true;
        settled = true;
        options.onUndone?.();
        toast.message('عملیات لغو شد.');
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
  const undoLabel = options.undoLabel ?? 'بازگردانی';
  const description =
    options.description ??
    'برای لغو، قبل از پایان زمان روی بازگردانی بزنید.';
  const tone = options.tone ?? 'default';

  options.apply();

  return showUndoableToast(tone, options.message, {
    id: `undoable-local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description,
    duration: durationMs,
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

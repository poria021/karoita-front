import { toast } from 'sonner';

export const UNDOABLE_MUTATION_DEFAULT_MS = 5_000;

export type UndoableMutationOptions<T> = {
  /** Pending copy shown while waiting for undo window. */
  message: string;
  description?: string;
  undoLabel?: string;
  durationMs?: number;
  /** Runs only if the user does not undo before the toast closes. */
  commit: () => Promise<T>;
  onCommitted?: (result: T) => void | Promise<void>;
  onUndone?: () => void;
  onError?: (error: unknown) => void;
};

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

  const toastId = toast(options.message, {
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

  return toastId;
}

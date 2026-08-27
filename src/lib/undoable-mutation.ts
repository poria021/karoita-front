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
  /**
   * اگر `true` باشد، commit تا بسته‌شدن toast به تأخیر می‌افتد.
   * وقتی کاربر «لغو» بزند قبل از بسته‌شدن، commit اصلاً ارسال نمی‌شود.
   * فقط برای real mode استفاده کن — mock mode باید فوری commit کنه
   * تا داده در localStorage قبل از هر reload ذخیره شده باشد.
   * پیش‌فرض: false (رفتار فعلی حفظ می‌شود)
   */
  deferCommit?: boolean;
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
 * Optimistic undoable Facade write.
 *
 * حالت پیش‌فرض (deferCommit: false):
 *   UI و commit هر دو فوری اجرا می‌شوند تا refresh داده را در mock/localStorage
 *   حفظ کند. Undo پس از تکمیل commit، تابع `reverse` را صدا می‌کند.
 *
 * حالت deferred (deferCommit: true):
 *   فقط UI فوری به‌روز می‌شود. commit تا بسته‌شدن toast به تأخیر می‌افتد.
 *   اگر کاربر «لغو» بزند قبل از بسته‌شدن، commit اصلاً ارسال نمی‌شود و
 *   UI به حالت قبل برمی‌گردد — بدون هیچ درخواستی به سرور.
 *   فقط برای real mode مناسب است (mock mode به commit فوری نیاز دارد).
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
  const deferCommit = options.deferCommit ?? false;

  options.apply();

  // تابع مشترک برای اجرای commit — در هر دو حالت فوری و deferred استفاده می‌شود.
  const runCommit = async (): Promise<T | undefined> => {
    // اگر کاربر قبلاً undo زده، commit را ارسال نکن
    if (undone) return undefined;
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
        return undefined;
      }
      toast.error(
        error instanceof Error ? error.message : 'عملیات ناموفق بود.'
      );
      return undefined;
    }
  };

  // حالت فوری: commit بلافاصله اجرا می‌شود (رفتار قبلی برای mock mode)
  const immediateCommitPromise = deferCommit ? null : runCommit();

  return showUndoableToast(tone, options.message, {
    id: `undoable-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description,
    duration: durationMs,
    ...undoableToastChrome(tone, durationMs),
    // حالت deferred: وقتی toast بسته می‌شود (auto یا دستی) commit ارسال می‌شود
    onAutoClose: deferCommit ? () => { void runCommit(); } : undefined,
    onDismiss: deferCommit ? () => { void runCommit(); } : undefined,
    action: {
      label: undoLabel,
      onClick: () => {
        if (undone || commitFailed) return;
        undone = true;
        void (async () => {
          if (immediateCommitPromise !== null) {
            // حالت فوری: صبر کن commit تمام شود، سپس reverse بزن
            await immediateCommitPromise;
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
          } else {
            // حالت deferred: commit هنوز نرفته، فقط UI را برگردان
            options.revert();
            options.onUndone?.();
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

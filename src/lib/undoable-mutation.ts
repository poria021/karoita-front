import type { CSSProperties } from 'react';
import { toast } from 'sonner';

export const UNDOABLE_MUTATION_DEFAULT_MS = 5_000;

export type UndoableToastTone = 'default' | 'success' | 'error' | 'warning';

export type UndoableMutationOptions<T> = {
  /** متن نتیجه به زمان گذشته (فوری؛ یک toast، بدون موفقیت جدا). */
  message: string;
  description?: string;
  undoLabel?: string;
  durationMs?: number;
  tone?: UndoableToastTone;
  apply: () => void;
  /** بازگردانی UI با «لغو» و وقتی `commit` شکست بخورد. */
  revert: () => void;
  /**
   * نوشتن Facade بلافاصله بعد از `apply` تا refresh داده را نگه دارد.
   * نوشتن را تا بستن toast عقب نیندازید — mock باید در localStorage زنده بماند.
   */
  commit: () => Promise<T>;
  /**
   * بعد از `commit` موفق، نوشتن Facade را برعکس می‌کند، بعد `revert`.
   * بدون این، «لغو» فقط اسنپ‌شات UI را برمی‌گرداند نه state ذخیره‌شده.
   */
  reverse?: (result: T) => Promise<void>;
  onCommitted?: (result: T) => void | Promise<void>;
  onUndone?: () => void;
  onError?: (error: unknown) => void;
  /**
   * اگر `true` باشد، `commit` تا بسته شدن toast عقب می‌افتد.
   * «لغو» قبل از بسته شدن اصلاً `commit` را نمی‌فرستد.
   * فقط در real؛ mock باید فوری `commit` کند تا قبل از reload در localStorage باشد.
   * پیش‌فرض: `false`.
   */
  deferCommit?: boolean;
};

export type UndoableLocalChangeOptions = {
  message: string;
  description?: string;
  undoLabel?: string;
  durationMs?: number;
  tone?: UndoableToastTone;
  apply: () => void;
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
 * نوشتن Facade با UI خوش‌بینانه و قابلیت لغو.
 *
 * پیش‌فرض (`deferCommit: false`): UI و `commit` هر دو فوری تا refresh داده را
 * در mock/localStorage نگه دارد. Undo بعد از `commit`، `reverse` را صدا می‌کند.
 *
 * `deferCommit: true`: فقط UI فوری است. `commit` تا بسته شدن toast عقب می‌افتد.
 * «لغو» قبل از بسته شدن اصلاً درخواست نمی‌فرستد. فقط برای real مناسب است.
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

  const runCommit = async (): Promise<T | undefined> => {
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

  // mock و حالت فوری: `commit` همان لحظه می‌رود
  const immediateCommitPromise = deferCommit ? null : runCommit();

  return showUndoableToast(tone, options.message, {
    id: `undoable-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description,
    duration: durationMs,
    ...undoableToastChrome(tone, durationMs),
    // deferred: بسته شدن toast (خودکار یا دستی) `commit` را می‌فرستد
    onAutoClose: deferCommit ? () => { void runCommit(); } : undefined,
    onDismiss: deferCommit ? () => { void runCommit(); } : undefined,
    action: {
      label: undoLabel,
      onClick: () => {
        if (undone || commitFailed) return;
        undone = true;
        void (async () => {
          if (immediateCommitPromise !== null) {
            // فوری: صبر تا `commit` تمام شود، بعد `reverse`
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
            // deferred: `commit` هنوز نرفته؛ فقط UI برگردد
            options.revert();
            options.onUndone?.();
          }
        })();
      },
    },
  });
}

/** تغییر محلی فوری با یک toast لغو (بدون هشدار دوم). */
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

/**
 * بدون لغو: ایجاد/ویرایش/تغییر وضعیت. `commit` همان لحظه است؛ شکست → `revert`.
 */
export type OptimisticMutationOptions<T> = {
  message: string;
  description?: string;
  tone?: UndoableToastTone;
  durationMs?: number;
  apply: () => void;
  revert: () => void;
  commit: () => Promise<T>;
  onCommitted?: (result: T) => void | Promise<void>;
  onError?: (error: unknown) => void;
};

export function scheduleOptimisticMutation<T>(
  options: OptimisticMutationOptions<T>
): string | number {
  const tone = options.tone ?? 'default';
  const durationMs = options.durationMs ?? UNDOABLE_MUTATION_DEFAULT_MS;

  options.apply();

  void (async () => {
    try {
      const result = await options.commit();
      await options.onCommitted?.(result);
    } catch (error) {
      options.revert();
      if (options.onError) {
        options.onError(error);
      } else {
        toast.error(
          error instanceof Error ? error.message : 'عملیات ناموفق بود.'
        );
      }
    }
  })();

  return showUndoableToast(tone, options.message, {
    description: options.description,
    duration: durationMs,
  });
}

/**
 * بدون لغو: فقط وضعیت محلی فوری و یک toast ساده.
 */
export type LocalChangeOptions = {
  message: string;
  description?: string;
  tone?: UndoableToastTone;
  apply: () => void;
};

export function scheduleLocalChange(options: LocalChangeOptions): string | number {
  const tone = options.tone ?? 'default';
  options.apply();
  return showUndoableToast(tone, options.message, {
    description: options.description,
  });
}


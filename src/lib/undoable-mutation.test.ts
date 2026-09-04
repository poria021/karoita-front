import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { toastMock } = vi.hoisted(() => {
  const toastFn = vi.fn(() => 'toast-1');
  return {
    toastMock: Object.assign(toastFn, {
      message: vi.fn(),
      error: vi.fn(() => 'toast-error'),
      warning: vi.fn(() => 'toast-warning'),
      success: vi.fn(() => 'toast-success'),
      dismiss: vi.fn(),
    }),
  };
});

vi.mock('sonner', () => ({
  toast: toastMock,
}));

import { PostCommitRefreshError } from '@/lib/post-commit-refresh';
import {
  UNDOABLE_DEFERRED_COMMIT_MS,
  scheduleOptimisticMutation,
  scheduleUndoableLocalChange,
  scheduleUndoableMutation,
} from '@/lib/undoable-mutation';

describe('scheduleUndoableMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('applies and commits immediately so refresh can keep persisted data', async () => {
    const apply = vi.fn();
    const revert = vi.fn();
    const commit = vi.fn(async () => 'ok');
    const onCommitted = vi.fn();

    scheduleUndoableMutation({
      message: 'حذف شد',
      apply,
      revert,
      commit,
      onCommitted,
    });

    expect(apply).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => {
      expect(commit).toHaveBeenCalledTimes(1);
      expect(onCommitted).toHaveBeenCalledWith('ok');
    });
    expect(revert).not.toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalled();
  });

  it('reverses commit then reverts UI when undo is pressed', async () => {
    const apply = vi.fn();
    const revert = vi.fn();
    const commit = vi.fn(async () => 'ok');
    const reverse = vi.fn(async () => undefined);
    const onUndone = vi.fn();

    scheduleUndoableMutation({
      message: 'حذف شد',
      apply,
      revert,
      commit,
      reverse,
      onUndone,
    });

    await vi.waitFor(() => {
      expect(commit).toHaveBeenCalledTimes(1);
    });

    const toastMockWithCalls = toastMock as unknown as {
      mock: { calls: Array<[unknown, { action?: { onClick: () => void; label: string } }]> };
    };
    const opts = toastMockWithCalls.mock.calls[0]?.[1];

    expect(opts?.action?.label).toBe('لغو');
    opts?.action?.onClick();

    await vi.waitFor(() => {
      expect(reverse).toHaveBeenCalledWith('ok');
      expect(revert).toHaveBeenCalledTimes(1);
      expect(onUndone).toHaveBeenCalledTimes(1);
    });
  });

  it('reverts UI when commit fails', async () => {
    const apply = vi.fn();
    const revert = vi.fn();
    const onError = vi.fn();

    scheduleUndoableMutation({
      message: 'حذف شد',
      apply,
      revert,
      commit: async () => {
        throw new Error('boom');
      },
      onError,
    });

    await vi.waitFor(() => {
      expect(revert).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalled();
    });
  });

  it('deferCommit: does not call commit when undo is pressed before toast closes', async () => {
    const apply = vi.fn();
    const revert = vi.fn();
    const commit = vi.fn(async () => 'ok');
    const onUndone = vi.fn();

    scheduleUndoableMutation({
      message: 'حذف شد',
      deferCommit: true,
      apply,
      revert,
      commit,
      onUndone,
    });

    expect(apply).toHaveBeenCalledTimes(1);
    expect(commit).not.toHaveBeenCalled();

    // شبیه‌سازی کلیک دکمهٔ «لغو» قبل از بسته شدن toast
    const toastMockWithCalls = toastMock as unknown as {
      mock: { calls: Array<[unknown, { action?: { onClick: () => void; label: string } }]> };
    };
    const opts = toastMockWithCalls.mock.calls[0]?.[1];
    opts?.action?.onClick();

    await vi.waitFor(() => {
      expect(revert).toHaveBeenCalledTimes(1);
      expect(onUndone).toHaveBeenCalledTimes(1);
    });
    expect(commit).not.toHaveBeenCalled();
  });

  it('deferCommit: calls commit when toast auto-closes without undo', async () => {
    const apply = vi.fn();
    const revert = vi.fn();
    const commit = vi.fn(async () => 'ok');
    const onCommitted = vi.fn();

    scheduleUndoableMutation({
      message: 'حذف شد',
      deferCommit: true,
      apply,
      revert,
      commit,
      onCommitted,
    });

    expect(apply).toHaveBeenCalledTimes(1);
    expect(commit).not.toHaveBeenCalled();

    const toastMockWithDuration = toastMock as unknown as {
      mock: { calls: Array<[unknown, { duration?: number }]> };
    };
    expect(toastMockWithDuration.mock.calls[0]?.[1]?.duration).toBe(
      UNDOABLE_DEFERRED_COMMIT_MS
    );

    // شبیه‌سازی بسته شدن خودکار toast
    const toastMockWithCalls = toastMock as unknown as {
      mock: { calls: Array<[unknown, { onAutoClose?: () => void }]> };
    };
    const opts = toastMockWithCalls.mock.calls[0]?.[1];
    opts?.onAutoClose?.();

    await vi.waitFor(() => {
      expect(commit).toHaveBeenCalledTimes(1);
      expect(onCommitted).toHaveBeenCalledWith('ok');
    });
    expect(revert).not.toHaveBeenCalled();
  });

  it('does not revert when onCommitted refetch fails after a successful write', async () => {
    const apply = vi.fn();
    const revert = vi.fn();
    const onError = vi.fn();

    scheduleUndoableMutation({
      message: 'حذف شد',
      apply,
      revert,
      commit: async () => 'ok',
      onCommitted: async () => {
        throw new Error('سرویس موقتاً در دسترس نیست. لطفاً کمی بعد تلاش کنید.');
      },
      onError,
    });

    await vi.waitFor(() => {
      expect(toastMock.warning).toHaveBeenCalled();
    });
    expect(revert).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('does not revert when commit throws PostCommitRefreshError', async () => {
    const apply = vi.fn();
    const revert = vi.fn();
    const onError = vi.fn();

    scheduleUndoableMutation({
      message: 'حذف شد',
      apply,
      revert,
      commit: async () => {
        throw new PostCommitRefreshError(new Error('HTTP 500'));
      },
      onError,
    });

    await vi.waitFor(() => {
      expect(toastMock.warning).toHaveBeenCalled();
    });
    expect(revert).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('uses toast.success for success tone', () => {
    scheduleUndoableMutation({
      tone: 'success',
      message: 'تمدید شد',
      apply: vi.fn(),
      revert: vi.fn(),
      commit: async () => 'ok',
    });

    expect(toastMock.success).toHaveBeenCalled();
    expect(toastMock).not.toHaveBeenCalled();
    const successMockWithCalls = toastMock.success as unknown as {
      mock: {
        calls: Array<[
          unknown,
          {
            className?: string;
            actionButtonStyle?: { background?: string };
          }
        ]>;
      };
    };
    const opts = successMockWithCalls.mock.calls[0]?.[1];
    expect(opts?.className).toContain('kv-toast-undoable');
    expect(opts?.actionButtonStyle?.background).toBe('var(--kv-danger-soft)');
  });
});

describe('scheduleUndoableLocalChange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('applies immediately and reverts on undo with error tone', () => {
    const apply = vi.fn();
    const revert = vi.fn();

    scheduleUndoableLocalChange({
      tone: 'error',
      message: 'حذف شد',
      apply,
      revert,
    });

    expect(apply).toHaveBeenCalledTimes(1);
    expect(toastMock.error).toHaveBeenCalled();

    const errorMockWithCalls = toastMock.error as unknown as {
      mock: { calls: Array<[unknown, { action?: { onClick: () => void; label: string } }]> };
    };
    const opts = errorMockWithCalls.mock.calls[0]?.[1];
    expect(opts?.action?.label).toBe('لغو');
    opts?.action?.onClick();
    expect(revert).toHaveBeenCalledTimes(1);
  });
});

describe('scheduleOptimisticMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps optimistic UI when onCommitted refetch fails', async () => {
    const apply = vi.fn();
    const revert = vi.fn();
    const onError = vi.fn();

    scheduleOptimisticMutation({
      message: 'افزوده شد',
      apply,
      revert,
      commit: async () => 'ok',
      onCommitted: async () => {
        throw new Error('سرویس موقتاً در دسترس نیست. لطفاً کمی بعد تلاش کنید.');
      },
      onError,
    });

    await vi.waitFor(() => {
      expect(toastMock.warning).toHaveBeenCalled();
    });
    expect(apply).toHaveBeenCalledTimes(1);
    expect(revert).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });
});

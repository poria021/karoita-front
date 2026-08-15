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

import {
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

    const opts = toastMock.mock.calls[0]?.[1] as {
      action?: { onClick: () => void; label: string };
    };

    expect(opts.action?.label).toBe('لغو');
    opts.action?.onClick();

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
    const opts = toastMock.success.mock.calls[0]?.[1] as {
      className?: string;
      actionButtonStyle?: { background?: string };
    };
    expect(opts.className).toContain('kv-toast-undoable--success');
    expect(opts.actionButtonStyle?.background).toBe('var(--kv-danger)');
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

    const opts = toastMock.error.mock.calls[0]?.[1] as {
      action?: { onClick: () => void; label: string };
    };
    expect(opts.action?.label).toBe('لغو');
    opts.action?.onClick();
    expect(revert).toHaveBeenCalledTimes(1);
  });
});
